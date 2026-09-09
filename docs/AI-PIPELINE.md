# AI Pipeline v0.4

The acquisition layer and the analysis layer are intentionally separate. Collected evidence persists first; AI can be rerun later as taxonomy/models improve.

## Current implemented adapter

Optional OpenAI adapter:

```text
OPENAI_API_KEY
AI_MODEL
EMBEDDING_MODEL=text-embedding-3-small
```

Tagging uses the OpenAI Responses API with Structured Outputs (`json_schema`) and explicitly sends `store: false`.

Embeddings use the `/v1/embeddings` endpoint. The resulting vector, provider, model and dimension count are persisted in `observation_embeddings`.

References:
- https://developers.openai.com/api/reference/cli/resources/responses/methods/create
- https://developers.openai.com/api/docs/models/text-embedding-3-small

## Tagging endpoint

```text
POST /api/ai/tag-pending
{"limit":20}
```

Flow:

1. Select pending normalized observations.
2. Ask the model only to organize/classify evidence.
3. Store taxonomy dimensions in `observation_tags`.
4. Store relevance score/language in `observations`.
5. Generate embeddings for the same texts.
6. Store vectors with model metadata.
7. Mark observation AI state as `embedded` when successful.

The Raw Signals page exposes this as **Analyze 20 pending** when persistent mode is active.

## Taxonomy policy

The first-pass model must not make strategic decisions. Useful dimensions include:

- topic
- intent
- sentiment
- pain_point
- pain_intensity
- jtbd
- use_case
- brand
- surface
- workaround
- desired_outcome

Human Review controls whether a signal is validated, watched, or rejected.

## Future Researcher / Challenger workers

The interfaces in `packages/ai` are ready for later workers:

```text
retrieval / clusters
      ↓
Researcher proposes evidence-backed hypothesis
      ↓
Challenger searches contradicting evidence / alternative causes
      ↓
Human validates or rejects
      ↓
Insight Knowledge Base
```

Do not send the entire Data Library to a model. Retrieve a bounded evidence set by source/time/taxonomy/vector similarity, then store the evidence IDs used for each claim.
