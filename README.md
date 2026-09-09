# Consumer Signal Engine

A repo-ready MVP foundation for turning social/market conversations into evidence-backed consumer insights.

## Locked architecture

- **Facebook Groups acquisition:** Apify Actor API (adapter-based; actor ID configurable)
- **Other sources:** future adapters for Reddit, YouTube, RSS, CSV/manual import
- **Database:** Supabase PostgreSQL
- **Frontend/API:** Next.js + TypeScript
- **AI layer:** provider-agnostic interfaces for tagging, clustering, research, challenge, opportunity scoring
- **Privacy:** anonymize authors before persistence in the observation layer

## Why this stack

We avoid building brittle Facebook scraping logic ourselves. The Facebook connector talks to Apify through a small adapter, so the actor can be replaced without changing the rest of the product.

Open-source projects used as architectural references only:
- Harken (MIT): adapter-oriented social listening architecture
- OpenMagpie (Apache-2.0): monitoring/watch concepts
- Radar Intelligence (AGPL-3.0): studied only; no source copied into this package

## Quick start

1. Copy `.env.example` to `.env.local`
2. Fill Supabase and Apify variables
3. Run SQL in `supabase/migrations/001_init.sql`
4. `npm install`
5. `npm run dev`

## MVP flow

Facebook Group URL -> Apify -> Normalizer -> Supabase -> AI Tagging -> Human Review -> Insight -> Evidence -> Opportunity

See `docs/ARCHITECTURE.md`, `docs/API-REPO-SELECTION.md`, and `docs/GITHUB-SETUP.md`.
