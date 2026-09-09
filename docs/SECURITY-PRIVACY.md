# Security and privacy baseline

This project is designed for aggregated consumer research, not individual profiling.

## Recommended defaults

- remove direct profile URLs before analysis;
- hash author identifiers when identity continuity is needed for deduplication;
- retain only fields required for evidence and aggregation;
- separate raw provider payloads from normalized observations;
- set a raw-data retention window;
- restrict service-role database keys to backend execution only;
- enable Supabase Row Level Security before production use;
- maintain a deletion process for imported datasets.

## Never commit

- Facebook cookies / session tokens;
- Apify tokens;
- Supabase service-role keys;
- AI provider keys;
- exported personal datasets.

## Evidence display

The UI should show enough original language to validate an insight, but production views should avoid surfacing unnecessary names, profile links or identifiers.

## Data governance questions before launch

1. What sources are allowed for the research purpose?
2. What is the lawful/contractual basis for collection?
3. How long is raw data retained?
4. Who can inspect original evidence?
5. Is data exported outside the workspace?
6. Can a source or observation be deleted and traced through derived outputs?
