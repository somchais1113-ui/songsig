export type TaxonomyTag = {
  dimension: "topic" | "intent" | "sentiment" | "pain_point" | "pain_intensity" | "jtbd" | "use_case" | "brand" | "surface" | string;
  value: string;
  confidence: number;
};

export type TaggingResult = {
  observationId: string;
  language?: string;
  relevanceScore: number;
  tags: TaxonomyTag[];
};

export interface Tagger {
  tag(input: {observationId:string;text:string;context?:Record<string,unknown>}): Promise<TaggingResult>;
}

export type EvidenceReference = {
  observationId: string;
  role: "supporting" | "contradicting" | "context";
  weight: number;
};

export type ResearchResult = {
  title: string;
  hypothesis: string;
  summary: string;
  evidence: EvidenceReference[];
  confidence: number;
};

export interface Researcher {
  analyze(input: {projectId:string;observations:Array<{id:string;text:string;tags:TaxonomyTag[]}>}): Promise<ResearchResult[]>;
}

export type ChallengeResult = {
  insightTitle: string;
  risks: string[];
  alternativeExplanations: string[];
  additionalEvidenceNeeded: string[];
};

export interface Challenger {
  challenge(input: ResearchResult): Promise<ChallengeResult>;
}

export interface EmbeddingProvider {
  embed(texts:string[]): Promise<{provider:string;model:string;dimensions:number;vectors:number[][]}>;
}
