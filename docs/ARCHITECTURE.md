# Architecture

## Layers

1. **Acquisition** — Apify / CSV / future APIs
2. **Normalization** — map provider-specific data into RawSocialItem
3. **Privacy transform** — hash/remove unnecessary personal identifiers
4. **Raw storage** — immutable provider payload for traceability
5. **Observation layer** — normalized research unit
6. **AI Tagging** — topic, pain point, JTBD, intent, sentiment
7. **Human Review** — relevant / noise / interesting / investigate
8. **Researcher** — pattern and hypothesis generation
9. **Challenger** — counter-evidence and alternative explanation
10. **Insight graph** — explicit evidence links
11. **Opportunity layer** — product/marketing/design decision support

## Design principle

Never let a provider-specific schema leak into the insight layer. This allows switching Apify actors or replacing Apify entirely without rewriting analytics.
