create extension if not exists pgcrypto;

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text,
  external_ref text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists raw_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete cascade,
  external_id text not null,
  source_url text,
  raw jsonb not null,
  fetched_at timestamptz default now(),
  unique(source_id, external_id)
);

create table if not exists observations (
  id uuid primary key default gen_random_uuid(),
  raw_item_id uuid references raw_items(id) on delete cascade,
  text text not null,
  author_hash text,
  published_at timestamptz,
  reactions int,
  comments int,
  shares int,
  review_status text default 'unreviewed',
  created_at timestamptz default now()
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid references observations(id) on delete cascade,
  dimension text not null,
  value text not null,
  confidence numeric,
  created_at timestamptz default now()
);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  statement text not null,
  status text default 'hypothesis',
  confidence numeric,
  created_at timestamptz default now()
);

create table if not exists insight_evidence (
  insight_id uuid references insights(id) on delete cascade,
  observation_id uuid references observations(id) on delete cascade,
  evidence_type text default 'support',
  primary key (insight_id, observation_id)
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid references insights(id) on delete set null,
  title text not null,
  volume_score numeric default 0,
  pain_score numeric default 0,
  growth_score numeric default 0,
  unmet_need_score numeric default 0,
  opportunity_score numeric generated always as ((volume_score + pain_score + growth_score + unmet_need_score) / 4.0) stored,
  created_at timestamptz default now()
);
