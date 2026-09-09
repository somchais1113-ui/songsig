# API / Repository Selection

This package is intentionally **clean-room application code**. It does not copy the source code of the reference social-listening repositories below.

## Production acquisition choice: Apify-maintained Facebook Groups Scraper

Default:

```text
apify/facebook-groups-scraper
```

Role:

- Facebook public-group acquisition layer
- receives Group URLs
- returns dataset rows through Apify API
- replaceable via `APIFY_FACEBOOK_GROUPS_ACTOR_ID`

Official API example currently uses:

```json
{
  "startUrls": [{"url":"https://www.facebook.com/groups/..."}],
  "resultsLimit": 20,
  "viewOption": "CHRONOLOGICAL"
}
```

Reference:
- https://apify.com/apify/facebook-groups-scraper/api

Reason selected:

- maintained provider rather than a brittle CSS-selector scraper embedded in our product
- async Actor runs and durable datasets
- API integration is isolated behind our connector
- cost can be guarded before run

It does **not** remove Facebook Terms/privacy/access risks. Public URLs may still produce partial or failed collections.

## Reference architecture: Harken

Repository:
- https://github.com/VladUZH/harken

Use from it:
- conceptual inspiration for source adapters / normalization boundaries

Do not vendor/copy its implementation into this package unless you separately review current license/version and deliberately decide to do so.

## Reference architecture: OpenMagpie

Repository:
- https://github.com/obris-dev/openmagpie

Use from it:
- conceptual inspiration for watch / semantic-filter / action flow

Again, the package implements its own code.

## Radar Intelligence

Repository:
- https://github.com/Scognamiglio1969/radar-intelligence

Useful as a product/feature reference, but **not incorporated into this package**. The earlier review identified AGPL-3.0 licensing implications for modified network services, so v0.4 avoids code-level dependency on it.

## Provider replacement rule

Anything provider-specific belongs under:

```text
packages/connectors/
```

Everything downstream consumes normalized records. Changing the Facebook provider must not require rewriting:

- Data Library
- observations
- AI taxonomy
- evidence graph
- Insight Board
- opportunity scoring
