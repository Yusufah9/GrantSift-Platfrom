-- 005_africa_grant_os_core.sql
-- Core PostgreSQL schema expansion for the Africa Grant Operating System (PRD §3, §7, §21, §22, §41, §44, §45, §49)

-- ---------------------------------------------------------------------
-- Expand Organizations with Africa-First & Onboarding Fields
-- ---------------------------------------------------------------------
alter table organizations add column if not exists registration_status text default 'Incorporated';
alter table organizations add column if not exists geographic_focus text default 'Nigeria';
alter table organizations add column if not exists primary_problem_addressed text;
alter table organizations add column if not exists typical_project_size numeric;
alter table organizations add column if not exists funding_currently_seeking numeric default 100000;
alter table organizations add column if not exists phone_number text;
alter table organizations add column if not exists custom_ai_prompt text;
alter table organizations add column if not exists current_grant_funding numeric default 0;
alter table organizations add column if not exists grants_received_last_12m integer default 0;
alter table organizations add column if not exists current_grant_programs text;

-- ---------------------------------------------------------------------
-- Funding Profiles (PRD §7: Organization First -> Funding Profile)
-- ---------------------------------------------------------------------
create table if not exists funding_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade unique,
  primary_sectors jsonb not null default '[]',
  technology_keywords jsonb not null default '[]',
  funding_interests jsonb not null default '[]',
  target_award_min numeric not null default 10000,
  target_award_max numeric not null default 500000,
  currency text not null default 'USD',
  eligible_countries jsonb not null default '["Nigeria"]',
  eligible_regions jsonb not null default '["Sub-Saharan Africa", "Africa"]',
  is_verified boolean not null default true,
  summary_narrative text,
  last_synthesized_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists funding_profiles_org_idx on funding_profiles(organization_id);

-- ---------------------------------------------------------------------
-- Funder Database & Strategic Funder Profiles (PRD §21, §22, §23)
-- ---------------------------------------------------------------------
create table if not exists funder_entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  funder_type text not null default 'Private Foundation',
  headquarters_country text not null default 'United States',
  website text,
  contact_email text,
  geographic_focus jsonb not null default '["Africa"]',
  sectors jsonb not null default '[]',
  typical_grant_min numeric,
  typical_grant_max numeric,
  currency text not null default 'USD',
  historical_giving_summary text,
  typical_recipients text,
  unsolicited_applications_open boolean not null default false,
  application_method text default 'online_portal',
  notes text,
  verification_status text not null default 'verified',
  previous_grantees jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists funder_entities_slug_idx on funder_entities(slug);

-- ---------------------------------------------------------------------
-- Saved Grants & Saved Funders (PRD §12, §21)
-- ---------------------------------------------------------------------
create table if not exists saved_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id text not null,
  grant_title text not null,
  funder_name text not null,
  amount_max numeric,
  currency text default 'USD',
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  unique(organization_id, grant_id)
);

create index if not exists saved_grants_org_idx on saved_grants(organization_id);

create table if not exists saved_funders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  funder_id text not null,
  funder_name text not null,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  unique(organization_id, funder_id)
);

create index if not exists saved_funders_org_idx on saved_funders(organization_id);

-- ---------------------------------------------------------------------
-- Organization Tasks & Deadlines (PRD §41, §42)
-- ---------------------------------------------------------------------
create table if not exists organization_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  application_id uuid references grant_applications(id) on delete set null,
  grant_id text,
  title text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  due_date date,
  priority text not null default 'medium', -- low, medium, high, urgent
  status text not null default 'todo', -- todo, in_progress, completed, cancelled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists org_tasks_org_idx on organization_tasks(organization_id);
create index if not exists org_tasks_due_idx on organization_tasks(due_date);

-- ---------------------------------------------------------------------
-- Award Budgets & Expenses (PRD §43, §44)
-- ---------------------------------------------------------------------
create table if not exists award_expenses (
  id uuid primary key default gen_random_uuid(),
  award_id uuid not null references program_awards(id) on delete cascade,
  category text not null, -- personnel, equipment, software, travel, operations, overhead
  description text not null,
  amount numeric not null,
  currency text not null default 'USD',
  expense_date date not null default current_date,
  receipt_url text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists award_expenses_award_idx on award_expenses(award_id);

-- ---------------------------------------------------------------------
-- Grant Reports (PRD §45)
-- ---------------------------------------------------------------------
create table if not exists grant_reports (
  id uuid primary key default gen_random_uuid(),
  award_id uuid not null references program_awards(id) on delete cascade,
  report_type text not null default 'progress', -- progress, financial, impact, final
  title text not null,
  period_start date,
  period_end date,
  due_date date not null,
  submitted_date date,
  status text not null default 'draft', -- draft, submitted, approved, revision_requested
  content text,
  metrics_summary jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists grant_reports_award_idx on grant_reports(award_id);

-- ---------------------------------------------------------------------
-- AI Conversations & Tool Calls (PRD §27, §28, §80)
-- ---------------------------------------------------------------------
create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Grant Intelligence Session',
  context jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null, -- user, assistant, system
  content text not null,
  tool_calls jsonb not null default '[]',
  actions jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists ai_messages_conv_idx on ai_messages(conversation_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table funding_profiles enable row level security;
alter table funder_entities enable row level security;
alter table saved_grants enable row level security;
alter table saved_funders enable row level security;
alter table organization_tasks enable row level security;
alter table award_expenses enable row level security;
alter table grant_reports enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;

-- Public read for funder entities
create policy "funder_entities: public read" on funder_entities for select using (true);
create policy "funder_entities: admin manage" on funder_entities for all
  using (exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'));

-- Organization-scoped member access
create policy "funding_profiles: org member access" on funding_profiles for all
  using (exists (
    select 1 from organizations o where o.id = funding_profiles.organization_id and (
      o.owner_id = auth.uid() or exists (
        select 1 from organization_members om where om.organization_id = o.id and om.user_id = auth.uid()
      )
    )
  ));

create policy "saved_grants: org member access" on saved_grants for all
  using (exists (
    select 1 from organizations o where o.id = saved_grants.organization_id and (
      o.owner_id = auth.uid() or exists (
        select 1 from organization_members om where om.organization_id = o.id and om.user_id = auth.uid()
      )
    )
  ));

create policy "saved_funders: org member access" on saved_funders for all
  using (exists (
    select 1 from organizations o where o.id = saved_funders.organization_id and (
      o.owner_id = auth.uid() or exists (
        select 1 from organization_members om where om.organization_id = o.id and om.user_id = auth.uid()
      )
    )
  ));

create policy "organization_tasks: org member access" on organization_tasks for all
  using (exists (
    select 1 from organizations o where o.id = organization_tasks.organization_id and (
      o.owner_id = auth.uid() or exists (
        select 1 from organization_members om where om.organization_id = o.id and om.user_id = auth.uid()
      )
    )
  ));
