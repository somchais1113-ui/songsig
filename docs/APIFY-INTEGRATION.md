# Apify Integration v0.4

## Default Actor

```env
APIFY_FACEBOOK_GROUPS_ACTOR_ID=apify/facebook-groups-scraper
```

The official API page currently demonstrates inputs including:

```json
{
  "startUrls": [{"url":"https://www.facebook.com/groups/..."}],
  "resultsLimit": 20,
  "viewOption": "CHRONOLOGICAL"
}
```

The v0.4 connector also exposes optional date/keyword fields used by the Actor input schema.

Reference: https://apify.com/apify/facebook-groups-scraper/api

## Why async

`/api/collections/start` starts an Actor and immediately persists the run ID.

`/api/collections/<jobId>/refresh` checks the provider later, then ingests the dataset when it succeeds.

This means a normal browser refresh does not delete or cancel the external run.

## Output mapping

Actor output schemas can change. Mapping is isolated in:

```text
packages/connectors/src/apifyFacebookGroups.ts
```

The normalizer accepts several candidate field names and preserves the original dataset row inside `metadata`, which is later stored in `raw_payload`.

Before scaling, run the `REAL-DATA-TEST.md` procedure and verify a real output sample.

## Cost guardrail

The UI calls `/api/collections/estimate` before starting. The configured rate is an estimate only and can be changed with:

```env
APIFY_FACEBOOK_ESTIMATED_USD_PER_1000_POSTS=2.60
COLLECTION_MAX_POSTS_PER_RUN=2000
```

## Incremental mode

The engine uses `last_seen_published_at` as a time boundary where possible, but still deduplicates overlaps by hash.

## Access limits

Do not infer that a group is complete merely because the URL is public. Store explicit access/coverage status and preserve provider failure messages.
