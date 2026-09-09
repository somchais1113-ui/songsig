# API & Repo Selection

## 1. Facebook Groups — Apify Actor API (PRIMARY)

Use an Apify Facebook Groups actor through the connector abstraction. Default env value is `simpleapi/facebook-groups-scraper`, but this is deliberately configurable because actor quality/pricing can change.

Why:
- programmatic REST API
- dataset output
- timeframe / result controls on compatible actors
- avoids maintaining brittle Facebook DOM automation ourselves

Do not hard-code the actor's response schema. Normalize it in `packages/connectors`.

## 2. Harken — architecture reference (YES)

License: MIT. Use ideas such as source adapters, normalized mention models, health/retry boundaries. We do not vendor its source in this package.

## 3. OpenMagpie — architecture reference (YES)

License: Apache-2.0. Use concepts around watches, semantic filtering, monitoring and webhook/action flows. We do not vendor its source.

## 4. Radar Intelligence — research reference only (NO CODE)

License: AGPL-3.0. A modified version exposed as a network service triggers AGPL source-sharing obligations. We therefore do not copy or vendor Radar source into this package.

## Selection rule

Acquisition providers are replaceable plugins. Consumer Signal taxonomy, evidence graph, human review, challenger logic and opportunity scoring remain our own product layer.
