export type RawSourceItem = {
  provider: string;
  externalId?: string;
  parentExternalId?: string;
  itemType: "post" | "comment" | "reply" | "other";
  sourceExternalId?: string;
  sourceName?: string;
  url?: string;
  publishedAt?: string;
  authorExternalId?: string;
  authorName?: string;
  text: string;
  engagement?: Record<string, number>;
  metadata?: Record<string, unknown>;
};

export type ProviderRun = {
  runId: string;
  status: string;
  datasetId?: string;
  startedAt?: string;
  finishedAt?: string;
};

export interface AsyncConversationConnector {
  name: string;
  start(input: Record<string, unknown>): Promise<ProviderRun>;
  getRun(runId: string): Promise<ProviderRun>;
  getItems(datasetId: string, options?: {limit?: number; offset?: number}): Promise<RawSourceItem[]>;
}
