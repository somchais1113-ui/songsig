-- Helper functions for semantic retrieval and Data Library metrics.

create or replace function public.match_observations(
  query_embedding extensions.vector,
  match_count integer default 50,
  min_relevance numeric default 0
)
returns table (
  observation_id uuid,
  normalized_text text,
  source_id uuid,
  published_at timestamptz,
  relevance_score numeric,
  similarity double precision
)
language sql stable
as $$
  select
    o.id,
    o.normalized_text,
    o.source_id,
    o.published_at,
    o.relevance_score,
    1 - (e.embedding <=> query_embedding) as similarity
  from public.observation_embeddings e
  join public.observations o on o.id = e.observation_id
  where coalesce(o.relevance_score, 0) >= min_relevance
  order by e.embedding <=> query_embedding
  limit greatest(1, least(match_count, 500));
$$;

create or replace view public.data_library_source_stats as
select
  s.id as source_id,
  s.workspace_id,
  s.platform,
  s.name,
  s.normalized_url,
  s.accessibility_status,
  s.active,
  s.watch_enabled,
  s.capabilities,
  s.provider,
  s.last_successful_sync_at,
  count(distinct r.id) as raw_item_count,
  count(distinct o.id) as observation_count,
  max(o.published_at) as newest_observation_at
from public.sources s
left join public.raw_items r on r.source_id = s.id
left join public.observations o on o.source_id = s.id
group by s.id;
