-- ============================================================
-- 008: Enhanced Application System
-- Adds custom form fields, document uploads, review tracking
-- ============================================================

-- Add application_form_fields to schemes (defines what custom fields an org scheme needs)
ALTER TABLE public.schemes
ADD COLUMN IF NOT EXISTS application_form_fields jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.schemes.application_form_fields IS 'JSON array of custom form field definitions for application forms. Each field: {id, type, label, required, placeholder, options, validation}';

-- Add form_responses and documents to scheme_applications
ALTER TABLE public.scheme_applications
ADD COLUMN IF NOT EXISTS form_responses jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.scheme_applications
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.scheme_applications
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id);

ALTER TABLE public.scheme_applications
ADD COLUMN IF NOT EXISTS review_notes text;

ALTER TABLE public.scheme_applications
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

COMMENT ON COLUMN public.scheme_applications.form_responses IS 'User responses to custom form fields. Key = field id, value = user answer';
COMMENT ON COLUMN public.scheme_applications.documents IS 'Array of uploaded document URLs with metadata';
COMMENT ON COLUMN public.scheme_applications.reviewed_by IS 'User ID of the reviewer (org owner or admin)';

-- Index for org dashboard queries
CREATE INDEX IF NOT EXISTS idx_applications_scheme_status ON public.scheme_applications(scheme_id, status);

-- ============================================================
-- Organization enhancements
-- ============================================================

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS banner_url text;

COMMENT ON COLUMN public.organizations.settings IS 'Organization settings: notification prefs, branding colors, etc.';

-- ============================================================
-- Notifications table (Supabase-side for persistent storage)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'admin_message' CHECK (type IN ('scheme_update', 'application_status', 'new_scheme', 'admin_message', 'org_update')),
  link text,
  read boolean DEFAULT false,
  related_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- RLS: Org owners can view applications to their schemes
-- ============================================================

CREATE POLICY "Org owners can view applications to their schemes"
  ON public.scheme_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.schemes s
      JOIN public.organizations o ON o.owner_id = s.created_by
      WHERE s.id = scheme_applications.scheme_id
      AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Org owners can update applications to their schemes"
  ON public.scheme_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.schemes s
      JOIN public.organizations o ON o.owner_id = s.created_by
      WHERE s.id = scheme_applications.scheme_id
      AND o.owner_id = auth.uid()
    )
  );
