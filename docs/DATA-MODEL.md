# Data Model v0.4

## Workspace
Ownership boundary for the Data Library and research outputs.

## ResearchProject
A business question or decision lens. It references evidence; it does not own/duplicate source data.

## Source
Reusable acquisition target: Facebook Group, imported dataset, channel, review source, etc.

Key states:
- accessibility status
- watch enabled
- last successful sync
- last seen published timestamp
- provider capability metadata

## CollectionJob
Durable workflow object created before an external provider run. Stores requested scope, estimated cost, provider run ID and terminal status.

## CollectionRun
Audit record of finalized data retrieval: requested/collected counts, duplicate count, coverage state and provider dataset ID.

## RawAsset
Metadata for an immutable JSON snapshot in private Supabase Storage.

## RawItem
Provider evidence row. Contains original text, provider payload and content hash.

## Observation
Normalized/anonymized analysis unit. This is what downstream AI/research works on.

## ObservationTag
Structured taxonomy key/value attached to an observation.

## ObservationEmbedding
Vector plus model/provider metadata for semantic search.

## ProjectObservation / ProjectSource
Many-to-many links allowing a project to reuse existing evidence.

## Cluster
Semantic/topic grouping of observations.

## Insight
Evidence-backed hypothesis, stored durably rather than regenerated every session.

## InsightEvidence
Links an insight to supporting, contradicting, or contextual observations.

## Challenge
Alternative explanations, bias risks, or missing evidence.

## Opportunity
Decision layer with separate volume / pain / growth / unmet-need components.

## SignalDefinition + SignalMetricDaily
Historical metric layer used for actual trend comparisons over time.
