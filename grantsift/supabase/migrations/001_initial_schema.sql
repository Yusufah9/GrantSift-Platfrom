-- GrantSift initial schema
-- Auth is handled entirely by Supabase Auth (auth.users). We only store
-- application-owned tables here and reference auth.users(id) by uuid.

create extension if not exists "pgcrypto";

create type project_status as enum ('draft', 'active', 'archived');
create type processing_status as enum ('pending', 'processing', 'completed', 'failed', 'partially_completed');
create type source_kind as enum ('funder_org', 'youtube_video', 'user_document', 'user_pasted_text');
create type source_trust as enum ('official_funder', 'government', 'institution', 'expert_source', 'ai_synthesis', 'user_provided');
create type sop_status as enum ('not_started', 'in_progress', 'blocked', 'done');
create type post_status as enum ('draft', 'published', 'archived');
create type app_role as enum ('user', 'admin');

-- ---------------------------------------------------------------------
-- Profiles (1:1 with auth.users, holds app-level fields Supabase Auth
-- doesn't store: role, display name)
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role app_role not null default 'user',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Projects — one per organization/application effort a user is running
-- ---------------------------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status project_status not null default 'draft',

  -- Organization profile
  org_name text,
  org_industry text,
  org_country text,
  org_website text,
  org_email text,
  org_team_size integer check (org_team_size is null or org_team_size >= 0),
  org_year_founded integer,
  org_social_links jsonb not null default '[]',
  org_traction text,
  org_funding_to_date numeric check (org_funding_to_date is null or org_funding_to_date >= 0),

  -- Grant target
  grant_funder_name text,
  grant_funder_url text,
  grant_amount_sought numeric check (grant_amount_sought is null or grant_amount_sought >= 0),
  grant_deadline date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on projects(user_id);

-- ---------------------------------------------------------------------
-- Sources — a funder org URL, a discovered YouTube video, an uploaded
-- document, or requirements text the user pasted directly.
-- ---------------------------------------------------------------------
create table sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  kind source_kind not null,
  trust source_trust not null,

  -- funder_org
  funder_url text,
  funder_name text,

  -- youtube_video (discovered because the channel/creator discusses
  -- winning a grant from this project's target funder)
  youtube_video_id text,
  youtube_url text,
  youtube_channel_title text,
  youtube_video_title text,
  transcript_available boolean,

  -- user_document / user_pasted_text
  storage_path text,
  pasted_text text,

  status processing_status not null default 'pending',
  status_detail text,
  raw_content text,
  created_at timestamptz not null default now()
);

create index sources_project_id_idx on sources(project_id);

-- ---------------------------------------------------------------------
-- Extracted insights — the output of extraction/classification/synthesis
-- over a source, always traceable back to it.
-- ---------------------------------------------------------------------
create table insights (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  category text not null, -- e.g. eligibility, budget_tip, narrative_tip, red_flag
  claim text not null,
  evidence_excerpt text,
  trust source_trust not null,
  confidence numeric check (confidence >= 0 and confidence <= 1),
  created_at timestamptz not null default now()
);

create index insights_project_id_idx on insights(project_id);

-- ---------------------------------------------------------------------
-- Readiness — gap assessment, every item traceable to a source or
-- explicit user input, never fabricated
-- ---------------------------------------------------------------------
create table readiness_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  requirement text not null,
  is_met boolean not null default false,
  gap_description text,
  traced_to_source_id uuid references sources(id) on delete set null,
  traced_to_user_input boolean not null default false,
  created_at timestamptz not null default now()
);

create index readiness_items_project_id_idx on readiness_items(project_id);

-- ---------------------------------------------------------------------
-- SOP tasks
-- ---------------------------------------------------------------------
create table sop_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  task text not null,
  owner text,
  input text,
  output text,
  depends_on uuid references sop_tasks(id) on delete set null,
  deadline date,
  status sop_status not null default 'not_started',
  required_document text,
  traced_to_source_id uuid references sources(id) on delete set null,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index sop_tasks_project_id_idx on sop_tasks(project_id);

-- ---------------------------------------------------------------------
-- Generated documents / exports
-- ---------------------------------------------------------------------
create table exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  file_kind text not null default 'xlsx',
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index exports_project_id_idx on exports(project_id);

-- ---------------------------------------------------------------------
-- Processing jobs — observability for the async pipeline
-- ---------------------------------------------------------------------
create table processing_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage text not null, -- source | video | transcript | extraction | classification | evidence | synthesis
  status processing_status not null default 'pending',
  error_code text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index processing_jobs_project_id_idx on processing_jobs(project_id);

-- ---------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------
create table authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  bio text
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  featured_image text,
  author_id uuid references authors(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  status post_status not null default 'draft',
  meta_description text,
  canonical_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table post_tags (
  post_id uuid not null references posts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table projects enable row level security;
alter table sources enable row level security;
alter table insights enable row level security;
alter table readiness_items enable row level security;
alter table sop_tasks enable row level security;
alter table exports enable row level security;
alter table processing_jobs enable row level security;
alter table posts enable row level security;

create policy "profiles: read own" on profiles for select using (auth.uid() = id);
create policy "profiles: update own" on profiles for update using (auth.uid() = id);

create policy "projects: owner full access" on projects for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Child tables inherit ownership through their parent project.
create policy "sources: via project ownership" on sources for all
  using (exists (select 1 from projects p where p.id = sources.project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = sources.project_id and p.user_id = auth.uid()));

create policy "insights: via project ownership" on insights for all
  using (exists (select 1 from projects p where p.id = insights.project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = insights.project_id and p.user_id = auth.uid()));

create policy "readiness_items: via project ownership" on readiness_items for all
  using (exists (select 1 from projects p where p.id = readiness_items.project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = readiness_items.project_id and p.user_id = auth.uid()));

create policy "sop_tasks: via project ownership" on sop_tasks for all
  using (exists (select 1 from projects p where p.id = sop_tasks.project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = sop_tasks.project_id and p.user_id = auth.uid()));

create policy "exports: via project ownership" on exports for all
  using (exists (select 1 from projects p where p.id = exports.project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = exports.project_id and p.user_id = auth.uid()));

create policy "processing_jobs: via project ownership" on processing_jobs for all
  using (exists (select 1 from projects p where p.id = processing_jobs.project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from projects p where p.id = processing_jobs.project_id and p.user_id = auth.uid()));

-- Blog: public can read published posts; only admins manage content.
create policy "posts: public read published" on posts for select
  using (status = 'published' or exists (
    select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'
  ));

create policy "posts: admin write" on posts for insert
  with check (exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'));

create policy "posts: admin update" on posts for update
  using (exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'));

create policy "posts: admin delete" on posts for delete
  using (exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'));
