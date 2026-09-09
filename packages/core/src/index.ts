export type AccessibilityStatus =
  | "unverified" | "accessible" | "partial" | "login_required"
  | "unsupported" | "blocked" | "failed";

export type CollectionMode = "discovery" | "targeted" | "incremental";
export type CoverageStatus = "unknown" | "complete" | "partial" | "truncated" | "failed";

export type SourceCapability = {
  posts?: boolean;
  comments?: boolean;
  replies?: boolean;
  reactions?: boolean;
  dateFilter?: boolean;
  keywordFilter?: boolean;
  incremental?: boolean;
};

export interface SourceRecord {
  id: string;
  platform: string;
  sourceType: string;
  name: string;
  sourceUrl?: string | null;
  normalizedUrl?: string | null;
  provider?: string | null;
  accessibilityStatus: AccessibilityStatus;
  capabilities: SourceCapability;
  active: boolean;
  watchEnabled: boolean;
  lastSuccessfulSyncAt?: string | null;
}

export interface CollectionPlan {
  mode: CollectionMode;
  resultsLimit: number;
  viewOption: "CHRONOLOGICAL" | "RECENT_ACTIVITY" | "TOP_POSTS" | "CHRONOLOGICAL_LISTINGS";
  onlyPostsNewerThan?: string;
  searchGroupKeyword?: string;
  includeComments: boolean;
  includeReactions: boolean;
}

export interface CoverageReport {
  status: CoverageStatus;
  postsRequested?: number;
  postsCollected: number;
  commentsCollected: number;
  repliesCollected: number;
  duplicatesSkipped: number;
  notes: string[];
}

export interface RawObservationInput {
  sourceId: string;
  provider: string;
  platformItemId?: string | null;
  platformParentId?: string | null;
  itemType: "post" | "comment" | "reply" | "review" | "manual" | "other";
  externalUrl?: string | null;
  publishedAt?: string | null;
  authorHash?: string | null;
  rawText: string;
  engagement: Record<string, unknown>;
  rawPayload: Record<string, unknown>;
  contentHash: string;
}

export function opportunityScore(input: {
  volume: number;
  pain: number;
  growth: number;
  unmetNeed: number;
}) {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const weighted =
    clamp(input.volume) * 0.2 +
    clamp(input.pain) * 0.3 +
    clamp(input.growth) * 0.2 +
    clamp(input.unmetNeed) * 0.3;
  return Math.round(weighted * 10) / 10;
}
