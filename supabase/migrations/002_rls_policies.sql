-- ============================================================
-- Citizen Scheme — Supabase Migration
-- 002: Row Level Security (RLS) Policies
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- Enable RLS on all tables
-- ──────────────────────────────────────────────────────────────
alter table public.user_profiles   enable row level security;
alter table public.schemes         enable row level security;
alter table public.scheme_applications enable row level security;
alter table public.admin_users     enable row level security;

-- ──────────────────────────────────────────────────────────────
-- user_profiles policies
-- ──────────────────────────────────────────────────────────────

-- Users can read their own profile
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can insert their own profile (created on auth callback)
create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on public.user_profiles for select
  using (
    exists (
      select 1 from public.admin_users where admin_users.id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- schemes policies
-- ──────────────────────────────────────────────────────────────

-- Anyone authenticated can read active schemes
create policy "Authenticated users can view active schemes"
  on public.schemes for select
  using (is_active = true);

-- Admins can do everything on schemes
create policy "Admins can manage schemes"
  on public.schemes for all
  using (
    exists (
      select 1 from public.admin_users where admin_users.id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users where admin_users.id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- scheme_applications policies
-- ──────────────────────────────────────────────────────────────

-- Users can view their own applications
create policy "Users can view own applications"
  on public.scheme_applications for select
  using (auth.uid() = user_id);

-- Users can insert their own applications
create policy "Users can create own applications"
  on public.scheme_applications for insert
  with check (auth.uid() = user_id);

-- Admins can view all applications
create policy "Admins can view all applications"
  on public.scheme_applications for select
  using (
    exists (
      select 1 from public.admin_users where admin_users.id = auth.uid()
    )
  );

-- Admins can update application status
create policy "Admins can update applications"
  on public.scheme_applications for update
  using (
    exists (
      select 1 from public.admin_users where admin_users.id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- admin_users policies
-- ──────────────────────────────────────────────────────────────

-- Admins can view the admin table (for self-check)
create policy "Admins can view admin_users"
  on public.admin_users for select
  using (auth.uid() = id);

-- Super admins can manage admin_users
create policy "Super admins manage admin_users"
  on public.admin_users for all
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.id = auth.uid() and admin_users.role = 'super_admin'
    )
  );
