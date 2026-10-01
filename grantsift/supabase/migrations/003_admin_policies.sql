-- Lets an admin read every profile (needed for the user management screen)
-- and change another user's role, without weakening the existing
-- "read/update own profile" policies for ordinary users.

create policy "profiles: admin read all" on profiles for select
  using (exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'));

create policy "profiles: admin update role" on profiles for update
  using (exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'));

-- Read-only visibility for the admin overview dashboard. Admins can see
-- counts and basic project info, but write access to a project stays
-- owner-only (see "projects: owner full access" in 001_initial_schema.sql).
create policy "projects: admin read all" on projects for select
  using (exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role = 'admin'));

