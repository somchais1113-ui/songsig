# Apify integration guide

## Goal

Apify is an acquisition provider, not part of the research domain. The application must remain functional if the selected Actor changes.

## Required variables

```env
APIFY_TOKEN=...
APIFY_FACEBOOK_GROUPS_ACTOR_ID=apify/facebook-groups-scraper
```

## Integration workflow

1. Choose the Actor you want to use.
2. Run a small sample manually in Apify first.
3. Export 10–20 records of real JSON.
4. Compare the result with `RawSourceItem` in `packages/connectors/src/types.ts`.
5. Update only `packages/connectors/src/apifyFacebookGroups.ts`.
6. Preserve the full original provider payload in `metadata` / `raw_payload` for auditability.
7. Normalize author identity before it reaches the analysis layer.

## Why the mapper is intentionally conservative

Facebook actors return different keys for post IDs, timestamps, engagement and group metadata. Freezing an assumed schema before a real run is a common failure mode. This package therefore includes field candidates but expects a real sample before production.

## Recommended input strategy

Start with one public group and a narrow research period. Prove the pipeline before increasing volume.

Suggested run sequence:

```text
Group URL
  -> Apify Actor
  -> dataset JSON
  -> connector mapper
  -> raw_items
  -> anonymize / normalize
  -> observations
  -> AI tagging
  -> human review
```

## Incremental ingestion

In production, keep a source-specific cursor / latest timestamp in `sources.config` and avoid reprocessing the entire group. Use `external_id` plus the database unique constraint to deduplicate.

## Error handling

Record every job in `ingestion_runs`. Never silently discard:
- provider failures;
- missing dataset IDs;
- malformed output;
- empty text;
- rate/usage limits.

## Private or restricted groups

Do not design the product around bypassing access controls. Treat restricted-source acquisition as an optional connector with explicit authorization, legal review and a privacy policy. Never commit browser cookies or session credentials to GitHub.
