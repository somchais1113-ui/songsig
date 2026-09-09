import type { Observation, Insight } from "@cse/core";

export type TaggingResult = Pick<Observation, "topic"|"intent"|"sentiment"|"painIntensity"|"confidence"|"tags">;

export interface Tagger {
  tag(text: string): Promise<TaggingResult>;
}

export type ResearchResult = {
  hypothesis: string;
  evidenceIds: string[];
  contradictions: string[];
  confidence: number;
};

export interface Researcher {
  analyze(observations: Observation[]): Promise<ResearchResult>;
}

export type ChallengeResult = {
  risks: string[];
  alternativeExplanations: string[];
  additionalEvidenceNeeded: string[];
};

export interface Challenger {
  challenge(result: ResearchResult, observations: Observation[]): Promise<ChallengeResult>;
}

export interface InsightRepository {
  save(insight: Insight): Promise<void>;
}
