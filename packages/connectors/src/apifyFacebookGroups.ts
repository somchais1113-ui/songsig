import type { AsyncConversationConnector, ProviderRun, RawSourceItem } from "./types";

type ApifyConfig = {
  token: string;
  actorId: string;
};

export type FacebookGroupActorInput = {
  groupUrl: string;
  resultsLimit: number;
  viewOption?: "CHRONOLOGICAL" | "RECENT_ACTIVITY" | "TOP_POSTS" | "CHRONOLOGICAL_LISTINGS";
  onlyPostsNewerThan?: string;
  searchGroupKeyword?: string;
};

const apiActorId = (actorId: string) => actorId.replace("/", "~");
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const firstString = (...values: unknown[]) => values.find(v => typeof v === "string" && v.trim()) as string | undefined;
const firstNumber = (...values: unknown[]) => {
  const v = values.find(x => typeof x === "number" || (typeof x === "string" && x.trim() !== "" && !Number.isNaN(Number(x))));
  return v === undefined ? 0 : Number(v);
};

export function buildFacebookGroupActorInput(input: FacebookGroupActorInput) {
  return {
    startUrls: [{ url: input.groupUrl }],
    resultsLimit: input.resultsLimit,
    viewOption: input.viewOption ?? "CHRONOLOGICAL",
    ...(input.onlyPostsNewerThan ? { onlyPostsNewerThan: input.onlyPostsNewerThan } : {}),
    ...(input.searchGroupKeyword ? { searchGroupKeyword: input.searchGroupKeyword } : {})
  };
}

export class ApifyFacebookGroupsConnector implements AsyncConversationConnector {
  name = "apify-facebook-groups";
  constructor(private config: ApifyConfig) {}

  private async request(path: string, init?: RequestInit) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`https://api.apify.com/v2/${path}${sep}token=${encodeURIComponent(this.config.token)}`, init);
    if (!res.ok) throw new Error(`Apify API ${res.status}: ${await res.text()}`);
    return res.json() as Promise<any>;
  }

  async start(input: Record<string, unknown>): Promise<ProviderRun> {
    const actor = encodeURIComponent(apiActorId(this.config.actorId));
    const json = await this.request(`actors/${actor}/runs`, {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(input)
    });
    const run = json?.data ?? {};
    return {
      runId: String(run.id),
      status: String(run.status ?? "RUNNING"),
      datasetId: run.defaultDatasetId ? String(run.defaultDatasetId) : undefined,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt
    };
  }

  async getRun(runId: string): Promise<ProviderRun> {
    const json = await this.request(`actor-runs/${encodeURIComponent(runId)}`);
    const run = json?.data ?? {};
    return {
      runId: String(run.id),
      status: String(run.status ?? "UNKNOWN"),
      datasetId: run.defaultDatasetId ? String(run.defaultDatasetId) : undefined,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt
    };
  }

  async getItems(datasetId: string, options: {limit?: number; offset?: number} = {}): Promise<RawSourceItem[]> {
    const params = new URLSearchParams({clean: "true", format: "json"});
    if (options.limit) params.set("limit", String(options.limit));
    if (options.offset) params.set("offset", String(options.offset));
    const json = await this.request(`datasets/${encodeURIComponent(datasetId)}/items?${params.toString()}`);
    const items = Array.isArray(json) ? json : [];
    return items.flatMap((raw, index) => this.normalizeDatasetRow(asRecord(raw), datasetId, index));
  }

  private normalizeDatasetRow(x: Record<string, unknown>, datasetId: string, index: number): RawSourceItem[] {
    const group = asRecord(x.group);
    const postId = firstString(x.postId, x.id, x.post_id);
    const postUrl = firstString(x.url, x.postUrl, x.post_url);
    const postText = firstString(x.text, x.postText, x.message, x.post_text) ?? "";
    const baseId = postId ?? postUrl ?? `${datasetId}:${index}`;
    const post: RawSourceItem = {
      provider: this.name,
      externalId: baseId,
      itemType: "post",
      sourceExternalId: firstString(x.groupId, x.group_id, group.id),
      sourceName: firstString(x.groupName, x.group_name, group.name),
      url: postUrl,
      publishedAt: firstString(x.time, x.timestamp, x.date, x.publishedAt),
      authorExternalId: firstString(x.userId, x.authorId, asRecord(x.author).id),
      authorName: firstString(x.userName, x.authorName, asRecord(x.author).name),
      text: postText,
      engagement: {
        likes: firstNumber(x.likes, x.likesCount),
        reactions: firstNumber(x.reactionsCount, x.reactions),
        comments: firstNumber(x.commentsCount, Array.isArray(x.comments) ? x.comments.length : undefined),
        shares: firstNumber(x.shares, x.sharesCount)
      },
      metadata: x
    };

    // Some Actors nest comments. Preserve thread relation when available.
    const commentsRaw = Array.isArray(x.comments) ? x.comments : [];
    const comments = commentsRaw.map((value, commentIndex): RawSourceItem => {
      const c = asRecord(value);
      const author = asRecord(c.author);
      return {
        provider: this.name,
        externalId: firstString(c.id, c.commentId, c.url) ?? `${baseId}:comment:${commentIndex}`,
        parentExternalId: baseId,
        itemType: "comment",
        sourceExternalId: post.sourceExternalId,
        sourceName: post.sourceName,
        url: firstString(c.url, c.commentUrl),
        publishedAt: firstString(c.time, c.timestamp, c.date, c.publishedAt),
        authorExternalId: firstString(c.userId, c.authorId, author.id),
        authorName: firstString(c.userName, c.authorName, author.name),
        text: firstString(c.text, c.commentText, c.message) ?? "",
        engagement: { likes: firstNumber(c.likes, c.likesCount, c.reactionsCount) },
        metadata: c
      };
    });

    return [post, ...comments].filter(item => item.text.trim() || item.url);
  }
}
