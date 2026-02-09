-- ============================================================
-- Fix infinite recursion in admin_users RLS policies
-- ============================================================

-- Drop existing problematic policies
drop policy if exists "Super admins manage admin_users" on public.admin_users;
drop policy if exists "Admins can view admin_users" on public.admin_users;

-- Create a security definer function to check if user is admin
-- This function bypasses RLS
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where id = user_id
  );
$$;

-- Create a security definer function to check if user is super admin
create or replace function public.is_super_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where id = user_id and role = 'super_admin'
  );
$$;

-- Recreate admin_users policies using security definer functions
create policy "Admins can view admin_users"
  on public.admin_users for select
  using (auth.uid() = id);

create policy "Super admins manage admin_users"
  on public.admin_users for all
  using (public.is_super_admin(auth.uid()));

-- Update other policies to use the security definer function
-- This prevents the recursion issue

-- Drop and recreate user_profiles admin policy
drop policy if exists "Admins can view all profiles" on public.user_profiles;
create policy "Admins can view all profiles"
  on public.user_profiles for select
  using (public.is_admin(auth.uid()));

-- Drop and recreate schemes admin policy
drop policy if exists "Admins can manage schemes" on public.schemes;
create policy "Admins can manage schemes"
  on public.schemes for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Drop and recreate scheme_applications admin policies
drop policy if exists "Admins can view all applications" on public.scheme_applications;
drop policy if exists "Admins can update applications" on public.scheme_applications;

create policy "Admins can view all applications"
  on public.scheme_applications for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update applications"
  on public.scheme_applications for update
  using (public.is_admin(auth.uid()));
