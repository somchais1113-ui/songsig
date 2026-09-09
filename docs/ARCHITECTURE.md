# Architecture

## Product principle

The engine is not a scraper dashboard. It is a decision-support system with evidence traceability.

```text
Data Sources
   │
   ├─ Facebook Groups / Apify
   ├─ CSV / Manual Research
   ├─ YouTube
   ├─ Reddit
   └─ Future providers
   ↓
Connector Layer
   ↓
Raw Items (immutable evidence)
   ↓
Normalization / anonymization / deduplication
   ↓
Observations
   ↓
AI Tagging + Clustering
   ↓
Human Review
   ↓
Researcher Agent
   ↓
Challenger Agent
   ↓
Validated Insight
   ↓
Opportunity Scoring
   ↓
Product / Marketing / Design action
```

## Why raw and observation layers are separate

`raw_items` preserve original evidence and provider payloads. `observations` contain normalized, anonymized, research-ready text and annotations. This allows the taxonomy to evolve without destroying the original source.

## Connector boundary

Every external source must map into the `RawSourceItem` contract. Provider-specific schemas remain inside the connector package. Do not leak Apify-specific fields into research logic.

## AI boundary

The first AI pass is organizational, not strategic. Tagger classifies. Researcher proposes hypotheses. Challenger attempts to falsify them. Humans retain authority over validation.

## Deployment target

- Web: Vercel
- Database: Supabase PostgreSQL
- Ingestion: Vercel route for light jobs; queue/worker for production workloads
- External collection: Apify or replaceable provider
- AI: provider-agnostic adapter

For high-volume ingestion, move collection and analysis into background jobs rather than a request/response Vercel function.
