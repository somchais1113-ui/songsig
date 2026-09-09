import type { RawSocialItem, SourceConnector } from './types';

export type FacebookGroupInput = {
  groupUrls: string[];
  limit?: number;
  newerThan?: string;
};

export class ApifyFacebookGroupsConnector implements SourceConnector<FacebookGroupInput> {
  constructor(private token: string, private actorId: string) {}

  async collect(input: FacebookGroupInput): Promise<RawSocialItem[]> {
    const actor = this.actorId.replace('/', '~');
    const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${encodeURIComponent(this.token)}`;
    const body = {
      startUrls: input.groupUrls,
      resultsLimit: input.limit ?? 100,
      onlyPostsNewerThan: input.newerThan ?? ''
    };
    const res = await fetch(url, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    if (!res.ok) throw new Error(`Apify request failed: ${res.status} ${await res.text()}`);
    const rows = await res.json() as any[];
    return rows.map((r, i) => ({
      source: 'facebook_group',
      externalId: String(r.id ?? r.postId ?? r.url ?? i),
      sourceUrl: r.url ?? r.postUrl,
      groupId: r.groupId,
      groupName: r.groupName,
      text: String(r.text ?? r.postText ?? r.message ?? ''),
      authorName: r.authorName ?? r.user?.name,
      publishedAt: r.time ?? r.timestamp ?? r.publishedAt,
      reactions: r.reactionsCount ?? r.likes ?? r.reactions,
      comments: r.commentsCount ?? r.comments,
      shares: r.sharesCount ?? r.shares,
      raw: r
    }));
  }
}
