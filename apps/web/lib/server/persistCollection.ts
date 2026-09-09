import "server-only";
import type { RawSourceItem } from "@cse/connectors";
import { getAdminSupabase } from "./supabaseAdmin";
import { anonymizeAuthor, contentHash, sha256 } from "./hash";
import { normalizeObservationText } from "./normalize";

type PersistInput = {
  workspaceId: string;
  sourceId: string;
  jobId: string;
  provider: string;
  providerRunId?: string;
  providerDatasetId?: string;
  postsRequested?: number;
  items: RawSourceItem[];
};

export async function persistCollection(input: PersistInput) {
  const db = getAdminSupabase();
  const startedAt = new Date().toISOString();
  const postCount = input.items.filter(x => x.itemType === "post").length;
  const commentCount = input.items.filter(x => x.itemType === "comment").length;
  const replyCount = input.items.filter(x => x.itemType === "reply").length;

  const { data: run, error: runError } = await db.from("collection_runs").insert({
    job_id: input.jobId,
    source_id: input.sourceId,
    provider: input.provider,
    provider_run_id: input.providerRunId,
    provider_dataset_id: input.providerDatasetId,
    posts_requested: input.postsRequested,
    posts_collected: postCount,
    comments_collected: commentCount,
    replies_collected: replyCount,
    coverage_status: input.postsRequested && postCount >= input.postsRequested ? "complete" : "partial",
    coverage_details: {
      note: "Coverage describes collected rows, not a claim that every item in the Facebook Group was accessible.",
      providerDatasetId: input.providerDatasetId ?? null
    },
    started_at: startedAt,
    completed_at: new Date().toISOString()
  }).select("id").single();
  if (runError) throw runError;

  // Immutable snapshot. It lets us remap/re-analyze without scraping Facebook again.
  const rawSnapshot = JSON.stringify({
    provider: input.provider,
    providerRunId: input.providerRunId,
    providerDatasetId: input.providerDatasetId,
    collectedAt: new Date().toISOString(),
    items: input.items
  });
  const objectPath = `${input.workspaceId}/${input.sourceId}/${new Date().toISOString().slice(0,10)}/${run.id}.json`;
  const bytes = Buffer.from(rawSnapshot, "utf8");
  const upload = await db.storage.from("raw-data").upload(objectPath, bytes, {
    contentType: "application/json",
    upsert: false
  });
  if (!upload.error) {
    await db.from("raw_assets").insert({
      workspace_id: input.workspaceId,
      source_id: input.sourceId,
      collection_run_id: run.id,
      bucket: "raw-data",
      object_path: objectPath,
      content_type: "application/json",
      byte_size: bytes.byteLength,
      sha256: sha256(rawSnapshot),
      immutable: true
    });
  }

  let inserted = 0;
  let duplicates = 0;
  let updated = 0;
  let newestPublishedAt: string | null = null;

  // Deliberately explicit row-by-row persistence in v0.3 for deterministic evidence IDs.
  // Optimize to RPC/batched COPY once volumes make this a bottleneck.
  for (const item of input.items) {
    const hash = contentHash({
      sourceId: input.sourceId,
      provider: input.provider,
      externalId: item.externalId,
      text: item.text,
      publishedAt: item.publishedAt,
      itemType: item.itemType
    });

    const rawRow = {
      workspace_id: input.workspaceId,
      source_id: input.sourceId,
      collection_run_id: run.id,
      provider: input.provider,
      platform_item_id: item.externalId ?? null,
      platform_parent_id: item.parentExternalId ?? null,
      item_type: item.itemType,
      external_url: item.url ?? null,
      published_at: item.publishedAt ?? null,
      author_hash: anonymizeAuthor(input.provider, item.authorExternalId, item.authorName),
      raw_text: item.text ?? "",
      engagement: item.engagement ?? {},
      raw_payload: item.metadata ?? {},
      content_hash: hash,
      collected_at: new Date().toISOString()
    };

    // Prefer the platform ID when available so edited posts/comments update the
    // canonical evidence row instead of colliding with the unique platform-ID index.
    // For providers without stable IDs, fall back to the content hash.
    let existingQuery = db
      .from("raw_items")
      .select("id,content_hash")
      .eq("source_id", input.sourceId);
    existingQuery = item.externalId
      ? existingQuery.eq("provider", input.provider).eq("platform_item_id", item.externalId)
      : existingQuery.eq("content_hash", hash);

    const { data: existing, error: existingError } = await existingQuery.maybeSingle();
    if (existingError) throw existingError;

    if (existing?.id) {
      if (existing.content_hash === hash) {
        // Same text can accumulate reactions/comments over time. Refresh mutable
        // metadata in the canonical evidence row while counting it as a dedup hit.
        const { error: rawRefreshError } = await db
          .from("raw_items")
          .update({
            collection_run_id: run.id,
            platform_parent_id: item.parentExternalId ?? null,
            external_url: item.url ?? null,
            engagement: item.engagement ?? {},
            raw_payload: item.metadata ?? {},
            collected_at: new Date().toISOString()
          })
          .eq("id", existing.id);
        if (rawRefreshError) throw rawRefreshError;

        const { error: engagementRefreshError } = await db
          .from("observations")
          .update({
            engagement_score: Object.values(item.engagement ?? {}).reduce<number>((sum, value) => sum + (Number(value) || 0), 0),
            updated_at: new Date().toISOString()
          })
          .eq("raw_item_id", existing.id);
        if (engagementRefreshError) throw engagementRefreshError;
        duplicates += 1;
      } else {
        // Same platform object, changed content/metadata. The immutable Storage
        // snapshot keeps the previous payload; the canonical row is refreshed so
        // future analysis uses the latest version without creating duplicate evidence.
        const { error: rawUpdateError } = await db
          .from("raw_items")
          .update(rawRow)
          .eq("id", existing.id);
        if (rawUpdateError) throw rawUpdateError;

        const { data: observation, error: observationLookupError } = await db
          .from("observations")
          .select("id")
          .eq("raw_item_id", existing.id)
          .maybeSingle();
        if (observationLookupError) throw observationLookupError;

        if (observation?.id) {
          const { error: observationUpdateError } = await db
            .from("observations")
            .update({
              normalized_text: normalizeObservationText(item.text ?? ""),
              published_at: item.publishedAt ?? null,
              engagement_score: Object.values(item.engagement ?? {}).reduce<number>((sum, value) => sum + (Number(value) || 0), 0),
              pii_status: "redacted",
              ai_status: "pending",
              human_status: "unreviewed",
              human_note: null,
              updated_at: new Date().toISOString()
            })
            .eq("id", observation.id);
          if (observationUpdateError) throw observationUpdateError;

          // Prior tags/embedding describe the old text. Delete them so the AI queue
          // deterministically rebuilds derived state from the refreshed evidence.
          const { error: tagDeleteError } = await db.from("observation_tags").delete().eq("observation_id", observation.id);
          if (tagDeleteError) throw tagDeleteError;
          const { error: embeddingDeleteError } = await db.from("observation_embeddings").delete().eq("observation_id", observation.id);
          if (embeddingDeleteError) throw embeddingDeleteError;

          // Any durable insight that cites edited evidence must be surfaced for
          // re-validation instead of silently keeping a "validated" appearance.
          const { data: linkedEvidence, error: linkedEvidenceError } = await db
            .from("insight_evidence")
            .select("insight_id")
            .eq("observation_id", observation.id);
          if (linkedEvidenceError) throw linkedEvidenceError;
          const insightIds = Array.from(new Set((linkedEvidence ?? []).map((row:{insight_id:string|null}) => row.insight_id).filter(Boolean)));
          if (insightIds.length) {
            const { error: staleInsightError } = await db
              .from("insights")
              .update({evidence_stale: true, updated_at: new Date().toISOString()})
              .in("id", insightIds);
            if (staleInsightError) throw staleInsightError;
          }
        }
        updated += 1;
      }

      if (item.itemType === "post" && item.publishedAt && (!newestPublishedAt || new Date(item.publishedAt) > new Date(newestPublishedAt))) {
        newestPublishedAt = item.publishedAt;
      }
      continue;
    }

    const { data: raw, error: rawError } = await db.from("raw_items").insert(rawRow).select("id").single();
    if (rawError) throw rawError;

    const { error: observationError } = await db.from("observations").insert({
      workspace_id: input.workspaceId,
      raw_item_id: raw.id,
      source_id: input.sourceId,
      normalized_text: normalizeObservationText(item.text ?? ""),
      published_at: item.publishedAt ?? null,
      engagement_score: Object.values(item.engagement ?? {}).reduce<number>((sum, value) => sum + (Number(value) || 0), 0),
      pii_status: "redacted",
      ai_status: "pending",
      human_status: "unreviewed"
    });
    if (observationError) throw observationError;
    inserted += 1;

    if (item.itemType === "post" && item.publishedAt && (!newestPublishedAt || new Date(item.publishedAt) > new Date(newestPublishedAt))) {
      newestPublishedAt = item.publishedAt;
    }
  }

  await db.from("collection_runs").update({duplicates_skipped: duplicates, items_updated: updated}).eq("id", run.id);
  await db.from("sources").update({
    last_successful_sync_at: new Date().toISOString(),
    ...(newestPublishedAt ? {last_seen_published_at: newestPublishedAt} : {})
  }).eq("id", input.sourceId);

  return {
    collectionRunId: run.id as string,
    inserted,
    duplicates,
    updated,
    postsCollected: postCount,
    commentsCollected: commentCount,
    repliesCollected: replyCount,
    rawSnapshotStored: !upload.error,
    rawSnapshotError: upload.error?.message ?? null
  };
}
