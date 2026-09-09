# Changelog

## v0.3.0 — Persistent acquisition + evidence architecture

### Added

- Supabase PostgreSQL persistence for sources, jobs, runs, raw evidence, observations, tags, vectors, insights, evidence links, opportunities and daily metrics.
- Private Supabase Storage bucket for immutable raw collection snapshots.
- Data Library separated from Research Projects so evidence can be reused without recollection.
- Facebook Group URL validation, collection planning, provider cost estimate and hard caps.
- Replaceable asynchronous Apify Facebook Groups connector.
- Persisted provider run IDs and refresh-safe pending-job recovery.
- Incremental Watch mode with Vercel Cron support.
- Stable-ID + content-hash deduplication.
- Edited-item handling: refresh canonical evidence, invalidate stale AI derivatives, mark linked Insights as stale for re-review, and retain immutable historical raw snapshot.
- Engagement refresh for unchanged re-collected items without duplicating observations.
- Privacy-oriented author hashing and text normalization.
- Optional OpenAI structured tagging and embeddings persisted to PostgreSQL/pgvector.
- Persistent Human Review decisions and Insight records.
- Basic Auth gate for early single-user deployments.
- Real-data test, persistence, AI, security and deployment documentation.

### Known intentional limits

- Automated clustering worker is not yet implemented.
- Supabase Auth + multi-user RLS policies are not yet implemented; server routes currently use service-role access behind the app auth gate.
- Facebook access/coverage depends on the configured acquisition provider and cannot be assumed complete.
- Visual/media analysis is not yet implemented.
