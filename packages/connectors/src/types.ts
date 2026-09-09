export type RawSourceItem = {
  provider: string;
  externalId: string;
  sourceId?: string;
  sourceName?: string;
  url?: string;
  publishedAt?: string;
  authorHash?: string;
  text: string;
  engagement?: Record<string, number>;
  metadata?: Record<string, unknown>;
};

export interface ConversationConnector {
  name: string;
  collect(input: Record<string, unknown>): Promise<RawSourceItem[]>;
}
