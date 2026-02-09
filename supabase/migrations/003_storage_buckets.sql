-- ============================================================
-- Citizen Scheme — Supabase Migration
-- 003: Storage Buckets
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. documents bucket — user-uploaded ID documents (Aadhaar, Voter ID)
-- ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  5242880,   -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Users can upload to their own folder
create policy "Users can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own documents
create policy "Users can view own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can read all documents
create policy "Admins can view all documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.admin_users where admin_users.id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 2. face-verification bucket — webcam captures for KYC
-- ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'face-verification',
  'face-verification',
  false,
  2097152,   -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Users can upload to their own folder
create policy "Users can upload face images"
  on storage.objects for insert
  with check (
    bucket_id = 'face-verification'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own face images
create policy "Users can view own face images"
  on storage.objects for select
  using (
    bucket_id = 'face-verification'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can read all face images
create policy "Admins can view all face images"
  on storage.objects for select
  using (
    bucket_id = 'face-verification'
    and exists (
      select 1 from public.admin_users where admin_users.id = auth.uid()
    )
  );
