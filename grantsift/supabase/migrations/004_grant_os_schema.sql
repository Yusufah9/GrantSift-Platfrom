-- Grant OS Platform Expansion Migration
-- Expands GrantSift into a scalable Grant Management Operating System (PRD §58, §93)

create type org_role as enum ('owner', 'admin', 'grant_writer', 'member', 'viewer');
create type application_stage as enum (
  'discovered',
  'research',
  'eligible',
  'drafting',
  'internal_review',
  'founder_approval',
  'submitted',
  'funder_review',
  'awarded',
  'rejected'
);
create type approval_status as enum ('pending', 'approved', 'changes_requested', 'rejected');
create type doc_permission as enum ('owner', 'edit', 'comment', 'view');
create type grant_lifecycle_status as enum ('open', 'closing_soon', 'closed', 'upcoming', 'archived');
create type disbursement_status as enum ('pending', 'approved', 'released');

-- ---------------------------------------------------------------------
-- Organizations (Permanent Multi-tenant Workspace - PRD §12, §13)
-- ---------------------------------------------------------------------
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  org_type text not null default 'Startup', -- Startup, SME, NGO, Social Enterprise, Researcher, Corporate
  industry text,
  sector text,
  country text,
  state text,
  city text,
  website text,
  description text,
  team_size integer check (team_size is null or team_size >= 0),
  year_founded integer,
  
  -- Problem & Solution statements
  problem_statement text,
  solution_statement text,
  target_beneficiaries text,
  business_model text,
  stage text, -- Idea, Pre-seed, Seed, Growth, Scale
  traction text,
  revenue numeric check (revenue is null or revenue >= 0),
  funding_received numeric check (funding_received is null or funding_received >= 0),
  runway_months integer,
  
  -- Impact
  impact_summary text,
  sdg_alignment jsonb not null default '[]',
  
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Organization Memberships (RBAC - PRD §8, §9, §10, §59)
-- ---------------------------------------------------------------------
create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role org_role not null default 'member',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists org_members_org_idx on organization_members(organization_id);
create index if not exists org_members_user_idx on organization_members(user_id);

-- ---------------------------------------------------------------------
-- Organization Scorecards (PRD §14)
-- ---------------------------------------------------------------------
create table if not exists scorecards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  overall_score integer not null check (overall_score >= 0 and overall_score <= 100),
  profile_score integer not null check (profile_score >= 0 and profile_score <= 100),
  legal_score integer not null check (legal_score >= 0 and legal_score <= 100),
  financial_score integer not null check (financial_score >= 0 and financial_score <= 100),
  impact_score integer not null check (impact_score >= 0 and impact_score <= 100),
  team_score integer not null check (team_score >= 0 and team_score <= 100),
  data_room_score integer not null check (data_room_score >= 0 and data_room_score <= 100),
  gaps jsonb not null default '[]',
  recommendations jsonb not null default '[]',
  strengths jsonb not null default '[]',
  evaluated_at timestamptz not null default now()
);

create index if not exists scorecards_org_idx on scorecards(organization_id);

-- ---------------------------------------------------------------------
-- Data Room Folders & Documents (PRD §15, §16, §17)
-- ---------------------------------------------------------------------
create table if not exists data_room_folders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists data_room_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  folder_id uuid references data_room_folders(id) on delete set null,
  name text not null,
  category text not null, -- corporate, financial, business, team, impact, grants, media, research
  file_type text not null default 'pdf',
  size_bytes integer not null default 0,
  storage_path text,
  permission_level doc_permission not null default 'view',
  version integer not null default 1,
  uploader_id uuid references auth.users(id) on delete set null,
  views_count integer not null default 0,
  downloads_count integer not null default 0,
  extracted_insights jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists docs_org_idx on data_room_documents(organization_id);

-- ---------------------------------------------------------------------
-- Grants Marketplace Database (PRD §19, §21, §22)
-- ---------------------------------------------------------------------
create table if not exists marketplace_grants (
  id uuid primary key default gen_random_uuid(),
  funder_name text not null,
  title text not null,
  slug text not null unique,
  description text not null,
  amount_max numeric,
  amount_min numeric,
  currency text not null default 'USD',
  deadline date,
  country text not null default 'Global',
  sector text not null,
  industry text,
  applicant_type text not null, -- Startup, SME, Non-profit, Social Enterprise, Academic
  eligibility_summary text not null,
  required_documents jsonb not null default '[]',
  application_questions jsonb not null default '[]',
  application_url text,
  source_url text not null,
  source_trust source_trust not null default 'official_funder',
  status grant_lifecycle_status not null default 'open',
  is_verified boolean not null default true,
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists marketplace_grants_status_idx on marketplace_grants(status);
create index if not exists marketplace_grants_deadline_idx on marketplace_grants(deadline);

-- ---------------------------------------------------------------------
-- Grant Applications & Workspace Tracker (PRD §25, §35, §38)
-- ---------------------------------------------------------------------
create table if not exists grant_applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  grant_id uuid references marketplace_grants(id) on delete set null,
  title text not null,
  funder_name text not null,
  amount_requested numeric,
  currency text not null default 'USD',
  deadline date,
  stage application_stage not null default 'discovered',
  assigned_writer_id uuid references auth.users(id) on delete set null,
  submission_date date,
  decision_date date,
  outcome text, -- awarded, rejected, pending, waitlisted
  external_submission_url text,
  external_confirmation_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists apps_org_idx on grant_applications(organization_id);

-- ---------------------------------------------------------------------
-- Proposals & Budget Line Items (PRD §29, §48)
-- ---------------------------------------------------------------------
create table if not exists application_proposals (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references grant_applications(id) on delete cascade,
  proposal_type text not null, -- grant_proposal, technical_proposal, financial_proposal, business_proposal, cover_letter, executive_summary
  title text not null,
  content text not null,
  version integer not null default 1,
  ai_reviewed boolean not null default false,
  review_feedback jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists application_budgets (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references grant_applications(id) on delete cascade,
  currency text not null default 'USD',
  total_amount numeric not null default 0,
  justification text,
  items jsonb not null default '[]', -- array of { id, category, description, quantity, unitCost, total }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Founder Approval Workflow (PRD §36)
-- ---------------------------------------------------------------------
create table if not exists founder_approvals (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references grant_applications(id) on delete cascade,
  founder_id uuid not null references auth.users(id) on delete cascade,
  status approval_status not null default 'pending',
  comments text,
  checklist_state jsonb not null default '{}',
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Funder Programs & Awards (PRD §32, §50, §51, §52, §53)
-- ---------------------------------------------------------------------
create table if not exists funder_programs (
  id uuid primary key default gen_random_uuid(),
  funder_user_id uuid not null references auth.users(id) on delete cascade,
  program_name text not null,
  description text not null,
  total_pool numeric not null default 0,
  currency text not null default 'USD',
  min_award numeric,
  max_award numeric,
  deadline date,
  eligibility_rules jsonb not null default '[]',
  questions jsonb not null default '[]',
  scoring_rubric jsonb not null default '[]',
  status grant_lifecycle_status not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists program_awards (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references funder_programs(id) on delete cascade,
  application_id uuid references grant_applications(id) on delete set null,
  recipient_name text not null,
  award_amount numeric not null,
  currency text not null default 'USD',
  disbursed_amount numeric not null default 0,
  start_date date,
  end_date date,
  agreement_url text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists disbursements (
  id uuid primary key default gen_random_uuid(),
  award_id uuid not null references program_awards(id) on delete cascade,
  tranche_number integer not null,
  amount numeric not null,
  currency text not null default 'USD',
  milestone_description text not null,
  status disbursement_status not null default 'pending',
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists impact_metrics (
  id uuid primary key default gen_random_uuid(),
  award_id uuid not null references program_awards(id) on delete cascade,
  kpi_name text not null,
  target_value numeric not null,
  current_value numeric not null default 0,
  unit text not null,
  reporting_frequency text not null default 'quarterly',
  last_reported_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Activity and Audit Logs (PRD §60)
-- ---------------------------------------------------------------------
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_org_idx on activity_logs(organization_id);

-- ---------------------------------------------------------------------
-- Row Level Security for New Tables
-- ---------------------------------------------------------------------
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table scorecards enable row level security;
alter table data_room_folders enable row level security;
alter table data_room_documents enable row level security;
alter table marketplace_grants enable row level security;
alter table grant_applications enable row level security;
alter table application_proposals enable row level security;
alter table application_budgets enable row level security;
alter table founder_approvals enable row level security;
alter table funder_programs enable row level security;
alter table program_awards enable row level security;
alter table disbursements enable row level security;
alter table impact_metrics enable row level security;
alter table activity_logs enable row level security;

-- Marketplace grants are publicly readable
create policy "marketplace_grants: public read" on marketplace_grants for select using (true);
create policy "marketplace_grants: admin write" on marketplace_grants for all
  using (exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'));

-- Organizations: accessible to members
create policy "organizations: member access" on organizations for all
  using (owner_id = auth.uid() or exists (
    select 1 from organization_members om where om.organization_id = organizations.id and om.user_id = auth.uid()
  ));

create policy "org_members: read by members" on organization_members for select
  using (user_id = auth.uid() or exists (
    select 1 from organizations o where o.id = organization_members.organization_id and o.owner_id = auth.uid()
  ));

create policy "scorecards: member access" on scorecards for all
  using (exists (
    select 1 from organizations o where o.id = scorecards.organization_id and (
      o.owner_id = auth.uid() or exists (
        select 1 from organization_members om where om.organization_id = o.id and om.user_id = auth.uid()
      )
    )
  ));

create policy "data_room_docs: member access" on data_room_documents for all
  using (exists (
    select 1 from organizations o where o.id = data_room_documents.organization_id and (
      o.owner_id = auth.uid() or exists (
        select 1 from organization_members om where om.organization_id = o.id and om.user_id = auth.uid()
      )
    )
  ));

create policy "grant_applications: member access" on grant_applications for all
  using (exists (
    select 1 from organizations o where o.id = grant_applications.organization_id and (
      o.owner_id = auth.uid() or exists (
        select 1 from organization_members om where om.organization_id = o.id and om.user_id = auth.uid()
      )
    )
  ));

create policy "funder_programs: funder access" on funder_programs for all
  using (funder_user_id = auth.uid() or exists (
    select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'
  ));
