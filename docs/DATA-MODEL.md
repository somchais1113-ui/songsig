# Data model

## ResearchProject
Defines the business question and scope.

## Source
A community, import file, channel, review site or other acquisition target.

## IngestionRun
Audit trail for every collection job.

## RawItem
Immutable evidence from a provider. Store the original payload only as long as needed.

## Observation
Normalized research unit. This is where topic, intent, sentiment, pain intensity and human review status live.

## Cluster
A semantic/topic grouping of observations.

## Insight
An evidence-backed hypothesis, not a generic summary.

## InsightEvidence
Traceability between a claim and supporting/contradicting observations.

## Challenge
Alternative explanations, bias risks or missing evidence.

## Opportunity
Decision layer. Ranked separately from mention volume.

Recommended opportunity components:
- volume
- pain intensity
- growth
- unmet need

Do not interpret the score as certainty. It is prioritization support.
