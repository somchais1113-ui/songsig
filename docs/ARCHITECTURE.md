# Architecture v0.3

## Product principle

The engine is a persistent decision-support system with evidence traceability, not a one-session scraper dashboard.

```text
External Sources
   │
   ├─ Facebook Groups / Apify
   ├─ CSV / Manual Research
   ├─ YouTube / Reddit (next connectors)
   └─ Future providers
   ↓
Replaceable Connector Layer
   ↓
Collection Job (durable provider run ID)
   ↓
Immutable Raw Snapshot (Supabase Storage)
   ↓
Raw Items (PostgreSQL evidence rows)
   ↓
Deduplicate / Normalize / Anonymize
   ↓
Observations (workspace Data Library)
   ↓
Tags + Embeddings + Clusters
   ↓
Project lens / Human Review
   ↓
Researcher Agent
   ↓
Challenger Agent
   ↓
Validated Insight ↔ Evidence Graph
   ↓
Opportunity Scoring
   ↓
Product / Marketing / Design action
```

## Browser responsibility

The browser is a view/controller, not data storage in persistent mode. Refreshing it does not erase collection jobs, evidence, or insights.

Demo mode uses localStorage only to make the UI usable before credentials are configured. It is visibly labelled as demo-local.

## Collection boundary

Provider-specific input/output stays inside `packages/connectors`. Downstream tables should not need Apify field names.

## Storage boundary

- Supabase Storage: immutable raw run snapshots.
- PostgreSQL: rows, relationships, research state, metrics.
- pgvector: semantic retrieval after an embedding model is selected.

## Project boundary

Evidence belongs to the Workspace Data Library. Research Projects create links/filters over that library instead of copying the dataset.

## Deployment target

- Web/API: Vercel or equivalent Next.js host
- DB/Storage: Supabase
- Acquisition: Apify or replacement provider
- Long-running/scheduled execution: future worker/cron layer
- AI: adapter interfaces under `packages/ai`

v0.3 intentionally resumes pending provider jobs when the UI returns. For unattended scheduled monitoring, add a background scheduler/worker instead of relying on a browser session.
