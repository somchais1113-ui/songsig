-- Consumer Signal Engine v0.3.0
-- Persistent Data Library + Research Projects + Collection Jobs + Evidence Graph

create extension if not exists pgcrypto;
create extension if not exists vector with schema extensions;

-- ---------- Workspace / ownership ----------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- ---------- Research is a lens over the Data Library ----------
create table if not exists public.research_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  question text,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Sources / acquisition ----------
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null,
  source_type text not null,
  name text not null,
  source_url text,
  normalized_url text,
  provider text,
  provider_ref text,
  accessibility_status text not null default 'unverified'
    check (accessibility_status in ('unverified','accessible','partial','login_required','unsupported','blocked','failed')),
  capabilities jsonb not null default '{}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  watch_enabled boolean not null default false,
  last_successful_sync_at timestamptz,
  last_seen_published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, normalized_url)
);

create table if not exists public.project_sources (
  project_id uuid not null references public.research_projects(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, source_id)
);

create table if not exists public.collection_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  mode text not null default 'discovery' check (mode in ('discovery','targeted','incremental')),
  status text not null default 'queued'
    check (status in ('queued','starting','running','succeeded','partial','failed','cancelled')),
  requested_scope jsonb not null default '{}'::jsonb,
  estimated_cost_usd numeric(12,4),
  provider text not null,
  provider_run_id text,
  provider_dataset_id text,
  started_at timestamptz,
  completed_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.collection_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.collection_jobs(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  provider text not null,
  provider_run_id text,
  provider_dataset_id text,
  posts_requested integer,
  posts_collected integer not null default 0,
  comments_collected integer not null default 0,
  replies_collected integer not null default 0,
  duplicates_skipped integer not null default 0,
  items_updated integer not null default 0,
  coverage_status text not null default 'unknown'
    check (coverage_status in ('unknown','complete','partial','truncated','failed')),
  coverage_details jsonb not null default '{}'::jsonb,
  raw_bytes bigint not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Metadata for immutable raw dataset snapshots in Supabase Storage.
create table if not exists public.raw_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  collection_run_id uuid references public.collection_runs(id) on delete set null,
  bucket text not null default 'raw-data',
  object_path text not null,
  content_type text,
  byte_size bigint,
  sha256 text,
  immutable boolean not null default true,
  created_at timestamptz not null default now(),
  unique(bucket, object_path)
);

-- Raw evidence rows. Keep payload so mappings can be rerun without recollection.
create table if not exists public.raw_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  collection_run_id uuid references public.collection_runs(id) on delete set null,
  provider text not null,
  platform_item_id text,
  platform_parent_id text,
  item_type text not null check (item_type in ('post','comment','reply','review','manual','other')),
  external_url text,
  published_at timestamptz,
  author_hash text,
  raw_text text not null default '',
  engagement jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  content_hash text not null,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Provider IDs when stable; hash fallback when not.
create unique index if not exists uq_raw_items_platform_id
  on public.raw_items(source_id, provider, platform_item_id)
  where platform_item_id is not null;
create unique index if not exists uq_raw_items_content_hash
  on public.raw_items(source_id, content_hash);

-- Normalized, anonymized unit used by AI/research.
create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  raw_item_id uuid not null unique references public.raw_items(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  normalized_text text not null,
  language text,
  published_at timestamptz,
  engagement_score numeric,
  pii_status text not null default 'anonymized' check (pii_status in ('pending','anonymized','redacted','approved')),
  ai_status text not null default 'pending' check (ai_status in ('pending','tagged','embedded','clustered','failed')),
  relevance_score numeric,
  human_status text not null default 'unreviewed' check (human_status in ('unreviewed','validated','watch','rejected')),
  human_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_observations (
  project_id uuid not null references public.research_projects(id) on delete cascade,
  observation_id uuid not null references public.observations(id) on delete cascade,
  included_by text not null default 'query',
  created_at timestamptz not null default now(),
  primary key(project_id, observation_id)
);

create table if not exists public.observation_tags (
  observation_id uuid not null references public.observations(id) on delete cascade,
  dimension text not null,
  value text not null,
  confidence numeric,
  model text,
  created_at timestamptz not null default now(),
  primary key(observation_id, dimension, value)
);

-- Dimension-less vector supports multiple embedding models. Add a partial ANN index after choosing one production model.
create table if not exists public.observation_embeddings (
  observation_id uuid primary key references public.observations(id) on delete cascade,
  provider text not null,
  model text not null,
  dimensions integer not null,
  embedding extensions.vector not null,
  created_at timestamptz not null default now()
);

-- ---------- Clusters / insights / evidence ----------
create table if not exists public.clusters (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.research_projects(id) on delete cascade,
  name text not null,
  description text,
  cluster_type text,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cluster_members (
  cluster_id uuid not null references public.clusters(id) on delete cascade,
  observation_id uuid not null references public.observations(id) on delete cascade,
  similarity numeric,
  created_at timestamptz not null default now(),
  primary key(cluster_id, observation_id)
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.research_projects(id) on delete cascade,
  title text not null,
  hypothesis text not null,
  summary text,
  status text not null default 'draft' check (status in ('draft','watch','validated','rejected','archived')),
  evidence_strength numeric,
  confidence numeric,
  evidence_stale boolean not null default false,
  created_by text not null default 'ai_researcher',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.insight_evidence (
  insight_id uuid not null references public.insights(id) on delete cascade,
  observation_id uuid not null references public.observations(id) on delete cascade,
  role text not null default 'supporting' check (role in ('supporting','contradicting','context')),
  weight numeric,
  note text,
  created_at timestamptz not null default now(),
  primary key(insight_id, observation_id, role)
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid not null references public.insights(id) on delete cascade,
  challenge_type text,
  statement text not null,
  severity text check (severity in ('low','medium','high')),
  evidence_needed text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.research_projects(id) on delete cascade,
  insight_id uuid references public.insights(id) on delete set null,
  name text not null,
  description text,
  volume_score numeric not null default 0,
  pain_score numeric not null default 0,
  growth_score numeric not null default 0,
  unmet_need_score numeric not null default 0,
  opportunity_score numeric not null default 0,
  status text not null default 'watch' check (status in ('watch','validate','explore','approved','rejected')),
  recommended_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Time series / watch mode ----------
create table if not exists public.signal_definitions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  key text not null,
  name text not null,
  definition jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(workspace_id, key)
);

create table if not exists public.signal_metrics_daily (
  signal_id uuid not null references public.signal_definitions(id) on delete cascade,
  metric_date date not null,
  mention_count integer not null default 0,
  engagement numeric not null default 0,
  pain_score numeric,
  sentiment_score numeric,
  source_count integer not null default 0,
  observation_count integer not null default 0,
  created_at timestamptz not null default now(),
  primary key(signal_id, metric_date)
);

create table if not exists public.watch_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  enabled boolean not null default true,
  cadence text not null default 'weekly',
  mode text not null default 'incremental',
  filter jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, source_id)
);

-- ---------- Performance ----------
create index if not exists idx_sources_workspace_platform on public.sources(workspace_id, platform);
create index if not exists idx_collection_jobs_source_created on public.collection_jobs(source_id, created_at desc);
create index if not exists idx_raw_items_source_published on public.raw_items(source_id, published_at desc);
create index if not exists idx_raw_items_parent on public.raw_items(source_id, platform_parent_id);
create index if not exists idx_observations_workspace_published on public.observations(workspace_id, published_at desc);
create index if not exists idx_observations_source on public.observations(source_id);
create index if not exists idx_observations_human_status on public.observations(workspace_id, human_status);
create index if not exists idx_tags_dimension_value on public.observation_tags(dimension, value);
create index if not exists idx_insights_workspace_status on public.insights(workspace_id, status);
create index if not exists idx_opportunities_workspace_score on public.opportunities(workspace_id, opportunity_score desc);
create index if not exists idx_signal_metrics_date on public.signal_metrics_daily(metric_date desc);

-- ---------- RLS ----------
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.research_projects enable row level security;
alter table public.sources enable row level security;
alter table public.project_sources enable row level security;
alter table public.collection_jobs enable row level security;
alter table public.collection_runs enable row level security;
alter table public.raw_assets enable row level security;
alter table public.raw_items enable row level security;
alter table public.observations enable row level security;
alter table public.project_observations enable row level security;
alter table public.observation_tags enable row level security;
alter table public.observation_embeddings enable row level security;
alter table public.clusters enable row level security;
alter table public.cluster_members enable row level security;
alter table public.insights enable row level security;
alter table public.insight_evidence enable row level security;
alter table public.challenges enable row level security;
alter table public.opportunities enable row level security;
alter table public.signal_definitions enable row level security;
alter table public.signal_metrics_daily enable row level security;
alter table public.watch_rules enable row level security;

-- MVP server routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS.
-- Add user-facing policies when Supabase Auth is enabled. Do not expose service-role credentials to the browser.
