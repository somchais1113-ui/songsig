import type { ConversationConnector, RawSourceItem } from "./types";

type ApifyConfig = {
  token: string;
  actorId: string;
};

export class ApifyFacebookGroupsConnector implements ConversationConnector {
  name = "apify-facebook-groups";
  constructor(private config: ApifyConfig) {}

  async collect(input: Record<string, unknown>): Promise<RawSourceItem[]> {
    const actor = encodeURIComponent(this.config.actorId);
    const runUrl = `https://api.apify.com/v2/acts/${actor}/runs?token=${encodeURIComponent(this.config.token)}&waitForFinish=120`;
    const run = await fetch(runUrl, {
      method: "POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify(input)
    });
    if (!run.ok) throw new Error(`Apify run failed: ${run.status} ${await run.text()}`);
    const runJson = await run.json() as any;
    const datasetId = runJson?.data?.defaultDatasetId;
    if (!datasetId) throw new Error("Apify run completed without a dataset ID.");

    const ds = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json&token=${encodeURIComponent(this.config.token)}`);
    if (!ds.ok) throw new Error(`Apify dataset read failed: ${ds.status}`);
    const items = await ds.json() as any[];

    // IMPORTANT: actor schemas differ. Adapt these field candidates after inspecting
    // a real sample from the selected actor. Keep this mapping isolated here.
    return items.map((x, index) => ({
      provider: this.name,
      externalId: String(x.id ?? x.postId ?? x.url ?? `${datasetId}:${index}`),
      sourceId: String(x.groupId ?? x.group?.id ?? ""),
      sourceName: String(x.groupName ?? x.group?.name ?? ""),
      url: x.url ?? x.postUrl,
      publishedAt: x.time ?? x.timestamp ?? x.date,
      text: String(x.text ?? x.postText ?? x.message ?? ""),
      engagement: {
        likes: Number(x.likes ?? x.reactionsCount ?? 0),
        comments: Number(x.commentsCount ?? x.comments?.length ?? 0),
        shares: Number(x.shares ?? x.sharesCount ?? 0)
      },
      metadata: x
    }));
  }
}
