-- ============================================================
-- Citizen Scheme — Supabase Migration
-- 001: Core Tables (user_profiles, schemes, scheme_applications, admin_users)
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- 1. user_profiles
-- ──────────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  email           text,
  phone           text,
  avatar_url      text,

  -- KYC / OCR data
  date_of_birth   text,            -- DD/MM/YYYY as extracted by OCR
  gender          text check (gender in ('male', 'female', 'other')),
  aadhaar_number  text,
  voter_id_number text,
  document_type   text,
  document_url    text,            -- path in 'documents' storage bucket

  -- Address
  address_line    text,
  district        text,
  state           text,
  pincode         text,

  -- Socio-economic
  annual_income   numeric,
  caste_category  text check (caste_category in ('general', 'obc', 'sc', 'st', 'ews')),
  occupation      text,
  disability_status boolean default false,

  -- Face verification
  face_image_front text,
  face_image_left  text,
  face_image_right text,
  face_verified    boolean default false,

  -- Status
  onboarding_completed boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

comment on table public.user_profiles is 'Extended profile data for every registered citizen.';

-- Index for common queries
create index if not exists idx_user_profiles_state on public.user_profiles(state);
create index if not exists idx_user_profiles_onboarding on public.user_profiles(onboarding_completed);

-- ──────────────────────────────────────────────────────────────
-- 2. schemes
-- ──────────────────────────────────────────────────────────────
create table if not exists public.schemes (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text unique not null,
  scheme_name         text not null,
  scheme_code         text unique,
  description         text,
  benefits            text,
  department          text,
  state               text,            -- null = central scheme
  category            text default 'General',
  eligibility_rules   jsonb default '{}'::jsonb,
  application_process text,
  official_website    text,
  is_active           boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

comment on table public.schemes is 'Government welfare schemes with rule-based eligibility criteria stored in JSONB.';

create index if not exists idx_schemes_slug on public.schemes(slug);
create index if not exists idx_schemes_active on public.schemes(is_active);
create index if not exists idx_schemes_state on public.schemes(state);
create index if not exists idx_schemes_category on public.schemes(category);

-- ──────────────────────────────────────────────────────────────
-- 3. scheme_applications
-- ──────────────────────────────────────────────────────────────
create table if not exists public.scheme_applications (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.user_profiles(id) on delete cascade,
  scheme_id           uuid not null references public.schemes(id) on delete cascade,
  status              text default 'pending' check (status in ('pending', 'approved', 'rejected', 'under_review')),
  eligibility_score   numeric default 0,
  eligibility_details jsonb default '{}'::jsonb,
  applied_at          timestamptz default now(),
  updated_at          timestamptz default now(),

  unique(user_id, scheme_id)
);

comment on table public.scheme_applications is 'Tracks which user applied to which scheme, plus eligibility score.';

create index if not exists idx_applications_user on public.scheme_applications(user_id);
create index if not exists idx_applications_scheme on public.scheme_applications(scheme_id);
create index if not exists idx_applications_status on public.scheme_applications(status);

-- ──────────────────────────────────────────────────────────────
-- 4. admin_users
-- ──────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz default now()
);

comment on table public.admin_users is 'Records which auth.users are granted admin access. Insert rows manually via SQL.';

-- ──────────────────────────────────────────────────────────────
-- 5. updated_at trigger (auto-touch on update)
-- ──────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_user_profiles
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_schemes
  before update on public.schemes
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_scheme_applications
  before update on public.scheme_applications
  for each row execute function public.handle_updated_at();
