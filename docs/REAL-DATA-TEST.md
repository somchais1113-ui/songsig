# First Real-Data Test

Do this before enabling hundreds of groups.

## Phase A — controlled 20-post run

1. Configure Supabase.
2. Configure `APIFY_TOKEN`.
3. Protect the deployment with Basic Auth.
4. Add one known public Facebook Group.
5. Set maximum posts to `20`.
6. Use Discovery mode.
7. Run preflight.
8. Save + collect.
9. Wait until the job is terminal.

Check:

- `collection_jobs` has provider run ID.
- `collection_runs` has collected counts.
- `raw-data` Storage contains one JSON snapshot.
- `raw_items` contains evidence rows.
- `observations` contains normalized rows.
- Data Library count survives a browser refresh.
- Raw Signals loads the stored observations.

## Phase B — inspect provider schema

Open the stored raw snapshot and compare field candidates with:

```text
packages/connectors/src/apifyFacebookGroups.ts
```

Confirm at least:

- post ID
- post URL
- published time
- post text
- comments format
- reaction/engagement fields
- group metadata

Update only the connector mapping if the provider schema differs.

## Phase C — duplicate test

Run the same 20-post scope again.

Expected result:

- new collection run exists
- raw snapshot exists
- existing unchanged items are skipped as duplicate evidence
- engagement/provider metadata can refresh on the canonical row
- observation total does not double
- `duplicates_skipped` increases

### Edited-item test

If the provider returns a stable platform ID whose text has changed:

- no second observation is created for the same platform item
- `items_updated` increases
- normalized text refreshes
- stale tags/embedding are removed
- AI and human-review state return to pending/unreviewed
- the earlier provider representation is still present in the immutable raw snapshot for the older collection run

## Phase D — incremental test

Add source to Watch, wait for new posts, then run `Sync new`.

Expected:

- `onlyPostsNewerThan` derives from the source cursor
- overlap is harmless because deduplication remains active
- only unseen evidence creates observations

## Do not scale until these are true

- Provider mapping verified against real output
- Duplicate behavior verified
- Storage snapshot verified
- Partial coverage wording visible
- Cost estimate close enough for the selected plan
- Privacy treatment approved for your research use case
