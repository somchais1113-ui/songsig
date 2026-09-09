# Consumer Signal Engine v0.3.0

A persistent, evidence-first consumer research system for turning conversation data into reusable signals, validated insights, and opportunity decisions.

v0.3 changes the prototype from a front-end dashboard into a **persistent acquisition + evidence architecture**:

- Paste a Facebook Group URL and validate/normalize it.
- Estimate collection scope/cost before starting a provider run.
- Start Facebook collection asynchronously through a replaceable Apify Actor.
- Persist provider job IDs so browser refreshes do not cancel the job.
- Resume unfinished jobs when the Sources page is reopened.
- Store an immutable raw JSON snapshot in Supabase Storage.
- Deduplicate by stable platform identity/content hash, refresh engagement metadata, and safely reprocess edited posts/comments.
- Create anonymized normalized observations in PostgreSQL.
- Keep Data Library separate from Research Projects so the same evidence can be reused without recollecting it.
- Prepare pgvector storage for semantic retrieval/embeddings.
- Optional OpenAI batch tagging + embeddings from the Raw Signals page, with analysis results persisted back to PostgreSQL.
- Keep Insights → Evidence links as durable Knowledge Base records, and flag insights for re-review when cited evidence is edited upstream.

## Product principle

```text
Acquire once
    ↓
Persist raw evidence
    ↓
Normalize / anonymize
    ↓
Tag / embed / cluster
    ↓
Human review
    ↓
Insight + contradicting evidence
    ↓
Opportunity
    ↓
Reuse the same Data Library for future research
```

A page refresh should never be the source of truth. The browser is only a view over the persistent store.

## Current modes

### 1. Demo mode

Works without credentials. UI data is mock/demo data. Added source configurations are retained in browser `localStorage`, so refreshing the page does not immediately reset the source list.

This is **not** server persistence and does not collect real Facebook data.

### 2. Persistent mode

When Supabase credentials are configured:

- Sources persist in PostgreSQL.
- Collection jobs persist in PostgreSQL.
- Raw snapshots persist in private Supabase Storage.
- Raw items and normalized observations persist in PostgreSQL.
- The Data Library and Raw Signals pages read from the database after refresh.

When an Apify token is also configured, the Facebook collector can start a real Actor run. `vercel.json` also includes an hourly Watch cron that finalizes completed provider runs and starts due incremental rules without requiring the Sources page to stay open.

## Stack

- Next.js 15 + React 19 + TypeScript
- Supabase PostgreSQL
- Supabase Storage (`raw-data` private bucket)
- `pgvector` extension for future semantic retrieval
- Apify Facebook Groups Actor as replaceable acquisition provider
- AI interfaces for Tagger / Researcher / Challenger / Embeddings

## Quick start — UI only

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Persistent setup

1. Create a Supabase project.
2. Run migrations in order:

```text
supabase/migrations/001_init.sql
supabase/migrations/002_helpers.sql
supabase/migrations/003_storage.sql
```

3. Optional: run `supabase/seed_demo.sql`.
4. Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_DEMO_MODE=false
```

5. For Facebook acquisition add:

```bash
APIFY_TOKEN=...
APIFY_FACEBOOK_GROUPS_ACTOR_ID=apify/facebook-groups-scraper
```

6. Restart the app.

The sidebar status should change to **Supabase persistent**.

## Recommended early deployment protection

The current MVP uses server routes with a Supabase service-role credential. Do not deploy those routes openly to the public.

For a single-user prototype set:

```bash
APP_BASIC_AUTH_USER=...
APP_BASIC_AUTH_PASSWORD=...
```

This protects the app and API with HTTP Basic Auth. A later multi-user version should replace this with Supabase Auth + workspace RLS policies.

## Facebook Group flow

```text
Paste Group URL
      ↓
URL validation / normalization
      ↓
Preflight capability report
      ↓
Collection estimate + hard cap
      ↓
Save Source
      ↓
Start Apify run asynchronously
      ↓
Persist job + provider run ID
      ↓
Poll now / resume after refresh
      ↓
Provider succeeds
      ↓
Store raw snapshot
      ↓
Deduplicate
      ↓
Hash author identity
      ↓
Create observations
      ↓
Data Library
```

**Important:** `Public Facebook Group` is not treated as proof that all posts/comments are accessible. The system records accessibility and coverage states (`unverified`, `accessible`, `partial`, `failed`, etc.) instead of claiming dataset completeness.

## Data durability

The persistent layer contains:

- `sources`
- `collection_jobs`
- `collection_runs`
- `raw_assets`
- `raw_items`
- `observations`
- `observation_tags`
- `observation_embeddings`
- `signal_metrics_daily`
- `insights`
- `insight_evidence`
- `opportunities`

Raw snapshots are designed to be immutable. If taxonomy or AI prompts improve later, the system can reprocess stored raw data instead of scraping the source again.

## Repository map

```text
apps/web/
  app/
    api/
      sources/
      collections/
      library/
      signals/
      system/
    library/
    sources/
    signals/
    research/
    insights/
    opportunities/
  components/
  lib/server/

packages/
  connectors/     provider adapters
  core/           domain types / scoring
  ai/             AI contracts

supabase/
  migrations/     persistent schema
  seed_demo.sql

docs/
  ARCHITECTURE.md
  PERSISTENCE-ARCHITECTURE.md
  COLLECTION-LIFECYCLE.md
  API-REPO-SELECTION.md
  REAL-DATA-TEST.md
  AI-PIPELINE.md
  SECURITY-PRIVACY.md
  DEPLOYMENT-CHECKLIST.md
```

## What v0.3 does not pretend to finish

The following are intentionally next layers rather than fake implementations:

- Automated clustering worker
- Supabase Auth / multi-user permissions UI
- Exhaustive Facebook Group access guarantees
- Visual/media analysis pipeline

These should be added after one real Facebook Group dataset has been collected and its output/coverage inspected.

## Provider note

The default Actor is configurable. Keep provider-specific mapping isolated in `packages/connectors/src/apifyFacebookGroups.ts` so a future actor/API can be swapped without rewriting the Data Library or Insight system.
