create extension if not exists pgcrypto;

create table if not exists research_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  question text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references research_projects(id) on delete cascade,
  type text not null,
  name text not null,
  provider text,
  external_ref text,
  url text,
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_sync_at timestamptz
);

create table if not exists ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete cascade,
  provider_run_id text,
  status text not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  item_count integer not null default 0,
  error text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists raw_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete cascade,
  ingestion_run_id uuid references ingestion_runs(id) on delete set null,
  provider text not null,
  external_id text not null,
  external_url text,
  published_at timestamptz,
  author_hash text,
  raw_text text not null,
  engagement jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  content_hash text,
  created_at timestamptz not null default now(),
  unique(source_id, provider, external_id)
);

create table if not exists observations (
  id uuid primary key default gen_random_uuid(),
  raw_item_id uuid references raw_items(id) on delete cascade,
  project_id uuid references research_projects(id) on delete cascade,
  normalized_text text not null,
  language text,
  topic text,
  intent text,
  sentiment text,
  pain_intensity numeric,
  confidence numeric,
  tags text[] not null default '{}',
  relevance_score numeric,
  human_status text not null default 'unreviewed',
  human_note text,
  created_at timestamptz not null default now()
);

create table if not exists clusters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references research_projects(id) on delete cascade,
  name text not null,
  description text,
  cluster_type text,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists cluster_members (
  cluster_id uuid references clusters(id) on delete cascade,
  observation_id uuid references observations(id) on delete cascade,
  similarity numeric,
  primary key(cluster_id, observation_id)
);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references research_projects(id) on delete cascade,
  title text not null,
  hypothesis text not null,
  summary text,
  status text not null default 'draft',
  evidence_strength numeric,
  confidence numeric,
  created_by text default 'ai_researcher',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists insight_evidence (
  insight_id uuid references insights(id) on delete cascade,
  observation_id uuid references observations(id) on delete cascade,
  role text not null default 'supporting',
  weight numeric,
  note text,
  primary key(insight_id, observation_id, role)
);

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid references insights(id) on delete cascade,
  challenge_type text,
  statement text not null,
  severity text,
  evidence_needed text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references research_projects(id) on delete cascade,
  insight_id uuid references insights(id) on delete set null,
  name text not null,
  description text,
  volume_score numeric not null default 0,
  pain_score numeric not null default 0,
  growth_score numeric not null default 0,
  unmet_need_score numeric not null default 0,
  opportunity_score numeric not null default 0,
  status text not null default 'watch',
  recommended_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_raw_items_source_published on raw_items(source_id, published_at desc);
create index if not exists idx_observations_project on observations(project_id);
create index if not exists idx_observations_topic on observations(topic);
create index if not exists idx_observations_human_status on observations(human_status);
create index if not exists idx_insights_project_status on insights(project_id, status);
create index if not exists idx_opportunities_project_score on opportunities(project_id, opportunity_score desc);

-- Production: add Row Level Security policies appropriate to your auth model.
