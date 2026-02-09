# Setup Guide

Complete guide to setting up Citizen Copilot for development.

## Prerequisites

- **Node.js** 18.18.0 or later
- **pnpm** 9+ (`npm install -g pnpm`)
- A **Supabase** project (free tier works)
- A **Google Cloud** project with OAuth 2.0 credentials
- A **Google AI Studio** API key for Gemini

## Step 1: Clone and Install

```bash
git clone <repo-url> CitizenScheme
cd CitizenScheme
pnpm install
```

## Step 2: Supabase Project Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon key** from Settings → API
3. Note your **service_role key** (keep this secret!)

### Run Migrations
In the Supabase SQL Editor, run each file in order:

1. **001_create_tables.sql** — Creates all tables, indexes, and triggers
2. **002_rls_policies.sql** — Enables RLS and creates security policies
3. **003_storage_buckets.sql** — Creates storage buckets with access policies
4. **004_seed_schemes.sql** — Seeds 10 sample government schemes

### Enable Google Auth
1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Toggle enabled
3. Enter your Google OAuth Client ID and Secret
4. Allowed redirect URL: `http://localhost:3000/api/auth/callback`

## Step 3: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the **Google+ API** or **People API**
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: **Web application**
6. Authorized redirect URIs: Add Supabase's callback URL (found in Auth → Providers → Google)
7. Copy the Client ID and Client Secret to Supabase

## Step 4: Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. This will be used for document OCR

## Step 5: Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
GEMINI_API_KEY=AIza...
```

## Step 6: Admin Access

After your first Google sign-in, find your user UUID:

```sql
-- In Supabase SQL Editor
SELECT id, email FROM auth.users;
```

Then grant admin access:

```sql
INSERT INTO admin_users (id, role) VALUES ('your-uuid-here', 'super_admin');
```

## Step 7: Run

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Troubleshooting

### "Invalid supabaseUrl" error
- Ensure `.env.local` has valid `NEXT_PUBLIC_SUPABASE_URL` (must start with `https://`)
- Restart the dev server after changing env vars

### OAuth redirect mismatch
- Ensure the redirect URL in Google Cloud Console matches Supabase's expected callback URL
- In Supabase Auth settings, verify the site URL is `http://localhost:3000`

### Face capture not working
- Browser must allow camera permissions
- HTTPS is required in production (localhost works in dev)
- Ensure `react-webcam` is installed: `pnpm add react-webcam`

### OCR returning empty results
- Check Gemini API key is valid
- Ensure document image is clear and well-lit
- Check API route logs for errors

## Production Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Update Supabase Auth redirect URL to your production domain

### Environment Variables for Production
All variables from `.env.local` need to be set in your hosting platform. The `NEXT_PUBLIC_*` variables are exposed to the client, others are server-only.
