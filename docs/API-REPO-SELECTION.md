# API and Repository Selection

## 1. Facebook Groups acquisition — Apify

**Use:** External acquisition layer.

Why:
- avoids maintaining brittle browser selectors in the core application;
- callable through API;
- provider can be replaced without redesigning the database;
- suitable for prototyping public-group research and provider-specific compliant workflows.

Implementation:
- `APIFY_FACEBOOK_GROUPS_ACTOR_ID` is configurable.
- inspect the selected Actor's live output before freezing the mapper.
- do not store credentials in frontend code.

## 2. Harken — architectural reference

Use its adapter/normalization philosophy as inspiration, not copied code. The engine in this package implements its own connector contract.

## 3. OpenMagpie — architectural reference

Use its watch/filter/action pattern as inspiration for future monitoring and alerts.

## 4. Radar Intelligence — do not embed

Do not copy or fork code into this package unless you deliberately choose to comply with AGPL-3.0 obligations. It can still be studied as a product/architecture reference.

## 5. Supabase

Use PostgreSQL as the canonical research database. The schema deliberately separates raw evidence, normalized observations, insights and opportunities.

## 6. AI provider

Keep provider-agnostic. Implement Tagger, Researcher and Challenger interfaces. This prevents the research workflow from depending on one model vendor.

## Facebook access warning

Facebook data access is volatile. Public/private availability, terms, authentication and actor behavior can change. Treat Facebook collection as a replaceable connector and confirm current platform rules before production use. Avoid collecting unnecessary personal identifiers; prefer aggregate research and anonymized evidence.
