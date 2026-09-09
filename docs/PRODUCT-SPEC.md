# Product Specification v0.4

## Core questions

### Overview
What changed? What matters? Where is evidence getting stronger?

### Sources
What are we collecting, can the provider access it, what will it cost, and is it being watched?

### Data Library
What evidence has already been acquired and can be reused without recollecting it?

### Raw Signals
What did people actually say in normalized/anonymized observations?

### Human Review
Which classifications or weak signals should a researcher validate, watch, or reject?

### Research
What hypothesis is emerging and what would disprove it?

### Insights
What do we believe, based on which supporting and contradicting evidence?

### Opportunities
What is worth testing, building, communicating, or researching next?

## v0.4 acceptance criteria

- Valid Facebook Group URL can be normalized by preflight.
- Collection size is cost-estimated and hard-capped.
- Source can persist in Supabase.
- External collection starts asynchronously and its provider run ID persists.
- Pending jobs are discoverable after refresh and can resume finalization.
- Successful run writes a raw Storage snapshot.
- Raw rows are deduplicated.
- Author identity is hashed before normalized observations are created.
- Data Library reads persistent source/evidence counts.
- Raw Signals reads stored observations when Supabase is configured.
- Data model supports project reuse, tags, vectors, evidence graph, and historical metrics.
- Demo mode is visually distinguished from persistent mode.
- Provider-specific mapping remains isolated.

## v0.4 entry experience acceptance criteria

- `/` is a dedicated product landing page and does not show the workspace sidebar.
- The primary landing CTA opens `/dashboard`.
- `/dashboard` provides an executive summary before the detailed workspace.
- Dashboard persistent counts come from `/api/dashboard` when Supabase is configured.
- Demo mode is visibly identified and must not masquerade as live production data.
- `/overview` remains the detailed signal overview and is explicitly separated from the executive dashboard.
- Sidebar navigation contains both `Dashboard` and `Signal Overview`.
- New entry surfaces are responsive at desktop, tablet, and mobile breakpoints.
