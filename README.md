# Consumer Signal Engine v0.2.0

Evidence-backed consumer research workspace for turning social and market conversations into decisions.

This package is a **functional product prototype**, not a placeholder. It includes a modern multi-page Next.js dashboard, realistic mock research data, interaction states, ingestion endpoints, an Apify Facebook Groups connector, a Supabase/PostgreSQL schema, and documentation for adapting the project into a production system.

## What is included

- Overview dashboard with signal KPIs, trend chart, emerging themes, source health and opportunity ranking
- Source management for Facebook Groups, CSV/manual import, YouTube, Reddit and future connectors
- Raw Signals browser with search and filters
- Human Review queue with Validate / Watch / Reject actions
- Research workspace with hypothesis, AI challenger, evidence strength and supporting observations
- Insights library with evidence traceability
- Opportunity board with scoring model
- Settings page for connector and model configuration
- `/api/ingest/apify` endpoint scaffold
- `packages/connectors` provider abstraction
- `packages/core` domain models and scoring utilities
- `packages/ai` analysis contracts
- Supabase migration covering sources, raw items, observations, clusters, insights, evidence and opportunities
- CI workflow and GitHub/Vercel setup docs

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Then open `http://localhost:3000`.

The prototype works with mock data without any credentials.

## Production path

1. Create a Supabase project and run `supabase/migrations/001_init.sql`.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Add an Apify token and choose a Facebook Groups actor.
4. Map the actor's real JSON output in `packages/connectors/src/apifyFacebookGroups.ts`.
5. Replace mock repository functions in `apps/web/lib/data.ts` with database queries.
6. Connect your preferred AI provider in `packages/ai`.
7. Deploy the web app to Vercel.

See `/docs` for architecture and implementation notes.

## License note

This package is original clean-room code. Harken and OpenMagpie were used as architectural references only; no source code from those repositories is copied into this package. Radar Intelligence is intentionally not embedded because of its AGPL-3.0 licensing implications for modified network services.

## Version

`0.2.0` — Functional Prototype
