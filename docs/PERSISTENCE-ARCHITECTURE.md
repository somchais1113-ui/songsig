# Persistence Architecture

## Why this layer exists

Consumer research compounds in value only when evidence survives the individual analysis session. Therefore the system separates **raw evidence**, **normalized observations**, and **derived knowledge**.

## Layer 1 — Raw snapshot

Destination: private Supabase Storage bucket `raw-data`.

Path convention:

```text
<workspace_id>/<source_id>/<YYYY-MM-DD>/<collection_run_id>.json
```

Properties:

- immutable by design
- one snapshot per finalized collection run
- contains provider identifiers and metadata needed to remap later
- not sent wholesale to an LLM

Purpose: reprocessing, audit, disaster recovery, schema migration.

## Layer 2 — Raw evidence rows

Table: `raw_items`.

Each row represents a post/comment/reply/review/manual record. Important fields:

- `source_id`
- `collection_run_id`
- `provider`
- `platform_item_id`
- `platform_parent_id`
- `item_type`
- `raw_text`
- `engagement`
- `raw_payload`
- `content_hash`

Deduplication and edits:

1. Stable provider/platform ID is the canonical identity when available.
2. `content_hash` is always generated from source/provider/type/platform ID/date/normalized text.
3. A repeated item with the same ID + same hash is a dedup hit; mutable engagement/provider metadata is refreshed without creating a second observation.
4. A repeated item with the same stable platform ID but a changed hash is treated as an edit. The canonical evidence + observation are refreshed, stale tags/embedding are removed, and AI/human review status is reset for re-analysis.
5. Providers without stable IDs fall back to source-scoped content-hash deduplication.
6. Every finalized collection still has an immutable Storage snapshot, so the pre-edit provider payload remains auditable even when the canonical row moves to the latest version.

## Layer 3 — Observations

Table: `observations`.

This is the analysis unit. It is separated from raw evidence so cleaning/anonymization can evolve without rewriting the provider snapshot.

- normalized text
- source reference
- published time
- engagement score
- PII state
- AI state
- relevance score
- human review state

## Layer 4 — Tags and vectors

`observation_tags` stores structured taxonomy dimensions rather than a single opaque AI JSON blob.

Examples:

```text
topic            Plastic adhesion
intent           Product search
pain_point       Paint peels from plastic
jtbd             Permanent marking
surface          PP plastic
sentiment        Negative
```

`observation_embeddings` stores vector representations and records provider/model/dimension. The table intentionally does not hard-code one embedding dimension so the data model can survive provider changes.

## Layer 5 — Knowledge Base

Insights are durable objects, not one-time chat responses.

`insights` → `insight_evidence` → `observations`

Evidence roles:

- supporting
- contradicting
- context

This allows a Challenger agent or researcher to inspect whether a conclusion is overfit to one community, brand, or viral post. If an upstream post/comment is edited, linked insights are marked `evidence_stale=true` so a previously validated conclusion cannot silently appear current.

## Layer 6 — Time series

`signal_metrics_daily` stores daily snapshots instead of overwriting current values.

Only then may the UI responsibly show statements such as:

```text
Waterproof permanence +48% vs previous period
```

The calculation should be derived from stored periods, not generated as prose by an LLM.

## Research Project separation

Sources and observations belong to the workspace Data Library.

Projects link to them through:

- `project_sources`
- `project_observations`

A new research project therefore does not require recollecting or copying the same Facebook data.
