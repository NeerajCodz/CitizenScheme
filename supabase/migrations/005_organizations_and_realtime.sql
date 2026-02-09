-- ============================================================
-- Citizen Scheme — Supabase Migration
-- 005: Organizations & Org Scheme Requests
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. organizations table
-- ──────────────────────────────────────────────────────────────
create table if not exists public.organizations (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  work_email  text not null,
  logo_url    text,
  website     text,
  address     text,
  state       text,
  district    text,
  verified    boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

comment on table public.organizations is 'Organizations that can propose schemes for citizens.';

create index if not exists idx_organizations_owner on public.organizations(owner_id);
create index if not exists idx_organizations_verified on public.organizations(verified);

-- ──────────────────────────────────────────────────────────────
-- 2. org_scheme_requests table
-- ──────────────────────────────────────────────────────────────
create table if not exists public.org_scheme_requests (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  scheme_data jsonb not null default '{}'::jsonb,
  status      text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

comment on table public.org_scheme_requests is 'Scheme proposals from organizations that need admin approval.';

create index if not exists idx_org_requests_org on public.org_scheme_requests(org_id);
create index if not exists idx_org_requests_status on public.org_scheme_requests(status);

-- ──────────────────────────────────────────────────────────────
-- 3. Add interested_tags to user_profiles
-- ──────────────────────────────────────────────────────────────
alter table public.user_profiles add column if not exists interested_tags text[] default '{}';

-- ──────────────────────────────────────────────────────────────
-- 4. Add created_by to schemes (nullable, tracks who created it)
-- ──────────────────────────────────────────────────────────────
alter table public.schemes add column if not exists created_by uuid references auth.users(id);

-- ──────────────────────────────────────────────────────────────
-- 5. RLS for organizations
-- ──────────────────────────────────────────────────────────────
alter table public.organizations enable row level security;
alter table public.org_scheme_requests enable row level security;

-- Owners can view/update their organization
create policy "Org owners can view own org"
  on public.organizations for select
  using (auth.uid() = owner_id);

create policy "Org owners can update own org"
  on public.organizations for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Org owners can insert own org"
  on public.organizations for insert
  with check (auth.uid() = owner_id);

-- Admins can view all organizations
create policy "Admins can view all orgs"
  on public.organizations for select
  using (
    exists (select 1 from public.admin_users where admin_users.id = auth.uid())
  );

-- Admins can update orgs (verify them)
create policy "Admins can update orgs"
  on public.organizations for update
  using (
    exists (select 1 from public.admin_users where admin_users.id = auth.uid())
  );

-- Org owners can manage their scheme requests
create policy "Org owners can view own requests"
  on public.org_scheme_requests for select
  using (
    exists (select 1 from public.organizations where organizations.id = org_id and organizations.owner_id = auth.uid())
  );

create policy "Org owners can insert requests"
  on public.org_scheme_requests for insert
  with check (
    exists (select 1 from public.organizations where organizations.id = org_id and organizations.owner_id = auth.uid())
  );

-- Admins can manage all scheme requests
create policy "Admins can view all scheme requests"
  on public.org_scheme_requests for select
  using (
    exists (select 1 from public.admin_users where admin_users.id = auth.uid())
  );

create policy "Admins can update scheme requests"
  on public.org_scheme_requests for update
  using (
    exists (select 1 from public.admin_users where admin_users.id = auth.uid())
  );

-- ──────────────────────────────────────────────────────────────
-- 6. Triggers for updated_at
-- ──────────────────────────────────────────────────────────────
create trigger set_updated_at_organizations
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_org_scheme_requests
  before update on public.org_scheme_requests
  for each row execute function public.handle_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 7. Enable Supabase Realtime on key tables
-- ──────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.schemes;
alter publication supabase_realtime add table public.scheme_applications;
alter publication supabase_realtime add table public.user_profiles;
alter publication supabase_realtime add table public.organizations;
alter publication supabase_realtime add table public.org_scheme_requests;
