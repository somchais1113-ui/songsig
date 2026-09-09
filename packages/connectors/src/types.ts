export type RawSocialItem = {
  source: string;
  externalId: string;
  sourceUrl?: string;
  groupId?: string;
  groupName?: string;
  text: string;
  authorName?: string;
  publishedAt?: string;
  reactions?: number;
  comments?: number;
  shares?: number;
  raw: unknown;
};

export interface SourceConnector<TInput = unknown> {
  collect(input: TInput): Promise<RawSocialItem[]>;
}
