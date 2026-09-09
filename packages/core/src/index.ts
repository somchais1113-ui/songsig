export type Observation = {
  id: string;
  rawItemId: string;
  sourceId: string;
  text: string;
  occurredAt?: string;
  topic?: string;
  intent?: string;
  sentiment?: "positive"|"neutral"|"negative"|"mixed";
  painIntensity?: number;
  confidence?: number;
  tags?: string[];
};

export type Insight = {
  id: string;
  title: string;
  hypothesis: string;
  strength: number;
  evidenceIds: string[];
  contradictionIds: string[];
  status: "draft"|"watch"|"validated"|"rejected";
};

export type OpportunityInputs = {
  volume: number;
  pain: number;
  growth: number;
  unmetNeed: number;
};

export function opportunityScore(x: OpportunityInputs) {
  const clamp=(n:number)=>Math.max(0,Math.min(100,n));
  const normalized=(clamp(x.volume)/100)*(clamp(x.pain)/100)*(clamp(x.growth)/100)*(clamp(x.unmetNeed)/100);
  return Math.round(Math.pow(normalized, 0.25) * 100);
}
