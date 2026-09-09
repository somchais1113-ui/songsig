# Security and Privacy Baseline v0.3

This project is intended for aggregated consumer research, not individual profiling.

## Ingestion defaults

- hash author identifiers before creating normalized observations;
- do not make profile identity part of AI taxonomy;
- keep provider payloads in the raw evidence layer, not in public UI fields;
- keep the `raw-data` Storage bucket private;
- preserve only data needed for the research purpose;
- design deletion/retention procedures before production scale.

## Service-role warning

v0.3 server API routes use `SUPABASE_SERVICE_ROLE_KEY` because the MVP does not yet include a complete sign-in flow.

Therefore:

1. Never expose that key as `NEXT_PUBLIC_*`.
2. Never call Supabase service role directly from a client component.
3. Protect an early deployment with `APP_BASIC_AUTH_USER` + `APP_BASIC_AUTH_PASSWORD`.
4. Before opening to multiple users, implement Supabase Auth and explicit workspace RLS policies.

## Never commit

- Facebook cookies/session tokens
- Apify token
- Supabase service-role key
- AI provider keys
- exported personal datasets

## Evidence display

Show enough original language for research validation, but avoid surfacing unnecessary names, profile links, or identifiers.

## Governance decisions before scale

- Which source types are authorized for this purpose?
- Which group/community rules apply?
- What is the retention window for raw provider payloads?
- Who can inspect raw evidence?
- How are deletion requests propagated to derived insights?
- Which downstream AI providers receive normalized text?
- Does a source contain sensitive personal data that should be excluded entirely?
