# Collection Lifecycle

## States

A collection job has durable status:

```text
queued → starting → running → succeeded
                          ↘ partial
                          ↘ failed
```

The provider run ID and dataset ID are stored in `collection_jobs`. Closing or refreshing the browser does not cancel the Apify run.

When the Sources page is reopened, `/api/collections/pending` finds unfinished jobs and resumes polling/finalization.

## Why asynchronous

Facebook Group collection can outlive a normal HTTP request. A synchronous browser request creates several problems:

- Vercel/server timeout risk
- accidental duplicate retries
- user assumes refresh cancelled work
- difficult cost accounting

The v0.3 flow starts the provider, stores its run ID, then finalizes later.

## Provider finalization

`POST /api/collections/<jobId>/refresh`

1. Read job from PostgreSQL.
2. Query provider run status.
3. If still running: keep durable job state.
4. If failed: store failure reason; do not fabricate data.
5. If succeeded: retrieve dataset.
6. Write immutable Storage snapshot.
7. Insert/deduplicate raw rows.
8. Create normalized observations.
9. Update source sync cursor.
10. Mark job terminal.

## Incremental sync

When mode is `incremental`, the source field `last_seen_published_at` becomes the default lower time boundary for the next run.

Deduplication is still mandatory because source ordering and provider pagination can overlap.

## Discovery vs targeted

### Discovery

Do not impose a keyword during acquisition. Use it when the research objective includes discovering unexpected needs or weak signals.

### Targeted

Use `searchGroupKeyword` to reduce noise/cost when investigating a known hypothesis. Remember that acquisition-time filtering can hide adjacent or unexpected language.

## Coverage language

Never display:

> “All 2,441 conversations in the group were analyzed.”

unless completeness is actually established.

Prefer:

> “2,441 conversations collected.”

and show:

- requested rows
- collected posts
- collected comments
- duplicates skipped
- collection window
- provider
- access status
- coverage status

## Unattended Watch execution

`vercel.json` schedules `/api/cron/watch` hourly.

The route:

1. authenticates with `CRON_SECRET`;
2. finalizes pending provider jobs;
3. finds due `watch_rules`;
4. avoids duplicate active jobs per source;
5. starts incremental collection;
6. advances the next run based on the rule cadence.

The default rule created from the Add Source dialog is weekly. The cron checks hourly, but does not scrape a weekly source hourly.

## Incremental cursor rule

`last_seen_published_at` advances from the newest **post** timestamp only. Comment/reply timestamps never advance the post cursor; otherwise a new comment on an old post could incorrectly skip newer posts on the next provider run. Overlap is still expected and is handled by deduplication.
