export type TaggingResult = { topics:string[]; painPoints:string[]; jobsToBeDone:string[]; intent?:string; sentiment?:string; confidence:number };
export type InsightHypothesis = { title:string; statement:string; evidenceIds:string[]; counterEvidenceIds:string[]; confidence:number };

export interface Tagger { tag(text:string): Promise<TaggingResult>; }
export interface Researcher { propose(observations:{id:string;text:string}[]): Promise<InsightHypothesis[]>; }
export interface Challenger { challenge(hypothesis:InsightHypothesis, observations:{id:string;text:string}[]): Promise<InsightHypothesis>; }
