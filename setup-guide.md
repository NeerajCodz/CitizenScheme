# Citizen Copilot — Complete Setup Guide

This guide will walk you through setting up the Citizen Copilot application from scratch, including all dependencies, databases, and third-party services.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and **pnpm** (or npm/yarn)
- **Git** for version control
- A **Supabase** account ([supabase.com](https://supabase.com))
- A **Convex** account ([convex.dev](https://convex.dev))
- A **Google Cloud** account for Gemini AI API
- A code editor (VS Code recommended)

---

## 🚀 Part 1: Project Setup

### 1.1 Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url> CitizenScheme
cd CitizenScheme

# Install dependencies
pnpm install
```

### 1.2 Create Environment File

Create a `.env.local` file in the root directory:

```bash
# Copy from example if available, or create new
touch .env.local
```

---

## 🗄️ Part 2: Supabase Setup

### 2.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `citizen-copilot` (or your preferred name)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to your users
4. Wait for project provisioning (~2 minutes)

### 2.2 Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGci...`)
   
3. Go to **Project Settings** → **API** → **Service Role**
4. Copy the **service_role key** (⚠️ Keep this secret!)

### 2.3 Add to Environment File

Update `.env.local` with your Supabase credentials:

```env
# ─── Supabase ───
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key
```

### 2.4 Run Database Migrations

The project includes 5 migration files in `supabase/migrations/`. Run them in order:

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI globally
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Run all migrations
supabase db push
```

**Option B: Manual SQL Execution**

1. Go to **SQL Editor** in Supabase Dashboard
2. Open and execute each migration file in order:
   - `001_initial_schema.sql` — Base tables (user_profiles, schemes, etc.)
   - `002_profiles_rls.sql` — Row Level Security policies
   - `003_admin_system.sql` — Admin users table and policies
   - `004_scheme_applications.sql` — Application tracking system
   - `005_organizations_and_realtime.sql` — Organizations + real-time subscriptions

### 2.5 Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Click **"New Bucket"** and create:
   
   **Bucket 1: `documents`**
   - **Public**: No (private)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/jpg`

   **Bucket 2: `face-verification`**
   - **Public**: No (private)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/jpg`

3. Set bucket policies (in **Policies** tab for each bucket):

   ```sql
   -- Allow authenticated users to upload their own files
   CREATE POLICY "Users can upload own files" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

   CREATE POLICY "Users can read own files" ON storage.objects
   FOR SELECT TO authenticated
   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Repeat for 'face-verification' bucket
   ```

4. Update `.env.local`:

```env
# ─── Supabase Storage Buckets ───
DOCUMENTS_BUCKET=documents
FACES_BUCKET=face-verification
```

### 2.6 Enable Realtime

The migration `005_organizations_and_realtime.sql` already enabled Realtime on these tables:
- `schemes`
- `scheme_applications`
- `user_profiles`
- `organizations`
- `org_scheme_requests`

Verify in **Database** → **Replication** → Ensure these tables are enabled.

### 2.7 Configure Google OAuth

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Google** provider
3. Follow the setup wizard to connect your Google OAuth app:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com)
   - Enable **Google+ API**
   - Create **OAuth 2.0 Client ID** (Web application)
   - Add authorized redirect URIs:
     ```
     https://<your-project>.supabase.co/auth/v1/callback
     http://localhost:3000/api/auth/callback
     ```
   - Copy **Client ID** and **Client Secret** to Supabase
4. Click **Save**

---

## 🔔 Part 3: Convex Setup (Real-Time Notifications)

### 3.1 Create Convex Account & Project

1. Go to [convex.dev](https://convex.dev) and sign up
2. Install Convex CLI if not already installed:

```bash
npm install -g convex
```

3. Login to Convex:

```bash
npx convex login
```

### 3.2 Initialize Convex in Project

```bash
# Initialize Convex (creates convex/ folder if not exists)
npx convex dev

# Follow prompts:
# - Create new project or select existing
# - Project name: citizen-copilot
# - Wait for deployment...
```

This command will:
- Deploy your Convex schema (`convex/schema.ts`)
- Deploy functions (`convex/notifications.ts`)
- Generate full TypeScript types in `convex/_generated/`
- **Output a deployment URL** (e.g., `https://academic-mandrill-760.convex.site`)

### 3.3 Add Convex URL to Environment

Copy the Convex deployment URL and add to `.env.local`:

```env
# ─── Convex ───
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.site
```

### 3.4 Keep Convex Running (Development)

For development, keep `npx convex dev` running in a separate terminal. It will:
- Watch for changes in `convex/` folder
- Auto-deploy on save
- Provide real-time logs

For production, use:

```bash
npx convex deploy --prod
```

---

## 🤖 Part 4: Google Gemini AI Setup

### 4.1 Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Get API Key"**
3. Create a new API key for your project
4. Copy the key (starts with `AIzaSy...`)

### 4.2 Add to Environment

```env
# ─── Google Gemini AI ───
GEMINI_API_KEY=AIzaSy...your-api-key
```

---

## 🏁 Part 5: Application Configuration

### 5.1 Complete Environment File

Your final `.env.local` should look like:

```env
# ─── Supabase ───
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# ─── Supabase Storage Buckets ───
DOCUMENTS_BUCKET=documents
FACES_BUCKET=face-verification

# ─── Google Gemini AI ───
GEMINI_API_KEY=AIzaSy...

# ─── Convex ───
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.site

# ─── App ───
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5.2 Seed Admin User (Optional)

To access the admin panel, you need at least one admin user. After creating an account through the app:

1. Go to Supabase **SQL Editor**
2. Get your user ID:
   ```sql
   SELECT id, email FROM auth.users;
   ```
3. Add yourself as admin:
   ```sql
   INSERT INTO admin_users (id, email, role, created_at)
   VALUES ('your-user-id-here', 'your-email@example.com', 'superadmin', NOW());
   ```

### 5.3 Seed Sample Schemes (Optional)

Add some sample government schemes for testing:

```sql
INSERT INTO schemes (
  name, category, eligibility_rules, benefits, 
  description, application_process
) VALUES 
(
  'Pradhan Mantri Awas Yojana',
  'Housing',
  '{"min_age": 18, "max_income": 300000, "caste_categories": ["SC", "ST", "OBC", "General"], "states": ["All India"]}'::jsonb,
  '{"housing_subsidy": "Up to ₹2.67 lakh", "loan_assistance": "Interest subsidy on home loans"}',
  'Credit-linked subsidy scheme for affordable housing',
  'Apply online at pmaymis.gov.in or through banks'
),
(
  'PM-KISAN',
  'Financial Assistance',
  '{"min_age": 18, "occupation": "Farmer", "states": ["All India"]}'::jsonb,
  '{"financial_assistance": "₹6000 per year in 3 installments"}',
  'Income support to all farmer families',
  'Register at pmkisan.gov.in with Aadhaar and land records'
);
```

---

## 🧪 Part 6: Running the Application

### 6.1 Development Mode

```bash
# Terminal 1: Start Convex dev
npx convex dev

# Terminal 2: Start Next.js dev server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6.2 Build for Production

```bash
# Build the app
pnpm build

# Start production server
pnpm start
```

### 6.3 Deployment

**Option A: Vercel (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add all environment variables in Vercel dashboard
```

**Option B: Other Platforms**

Compatible with any Node.js hosting platform. Ensure you:
- Set all environment variables
- Run `pnpm build` before starting
- Use `pnpm start` as start command

---

## 🎨 Part 7: Neomorphism Design System

The app uses a custom neomorphism design with utility classes. Key classes:

```css
.neo-flat       /* Default raised card */
.neo-pressed    /* Inset/pressed element */
.neo-convex     /* Gradient convex button */
.neo-card       /* Large card container */
.neo-btn        /* Interactive button */
.neo-input      /* Inset input field */
```

Design tokens are in `src/app/globals.css`:
- Background: Warm beige (`hsl(38, 25%, 95%)`)
- Light shadow: `hsl(40, 30%, 100%)`
- Dark shadow: `hsl(30, 12%, 78%)`

---

## 📁 Part 8: Project Structure

```
CitizenScheme/
├── convex/                      # Convex backend
│   ├── _generated/             # Auto-generated types (DO NOT EDIT)
│   ├── schema.ts               # Notification schema
│   └── notifications.ts        # Notification functions
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   ├── admin/              # Admin panel pages
│   │   ├── organization/       # Organization pages
│   │   ├── home/               # User homepage
│   │   ├── login/              # Split-screen login
│   │   ├── onboarding/         # 5-step onboarding
│   │   └── globals.css         # Neomorphism design tokens
│   ├── components/             # React components
│   │   ├── notifications/      # NotificationBell
│   │   ├── providers/          # ConvexProvider
│   │   ├── ui/                 # shadcn/ui components
│   │   └── verification/       # Face capture, document upload
│   ├── hooks/                  # Custom React hooks
│   │   └── useSupabaseRealtime.ts
│   └── lib/                    # Utilities and clients
│       ├── supabase/           # Supabase client & middleware
│       ├── utils.ts            # Helper functions
│       └── types.ts            # (Deprecated - use /types)
├── types/                      # TypeScript type definitions
│   ├── user.ts                 # User & admin types
│   ├── scheme.ts               # Scheme types
│   ├── organization.ts         # Organization types
│   ├── notification.ts         # Notification types
│   ├── ocr.ts                  # OCR result types
│   └── index.ts                # Barrel exports
├── supabase/                   # Database migrations
│   └── migrations/             # 5 SQL migration files
├── .env.local                  # Environment variables (DO NOT COMMIT)
└── setup-guide.md              # This file
```

---

## 🔧 Part 9: Key Features & Usage

### 9.1 User Flow

1. **Login** (`/login`):
   - Toggle between Citizen and Organization modes
   - Google OAuth authentication

2. **Onboarding** (`/onboarding`) — 5 steps:
   - Step 1: Upload Aadhaar/Voter ID
   - Step 2: Review OCR extracted data
   - Step 3: Add additional details (state, district, occupation, etc.)
   - Step 4: Face verification (front face becomes profile picture)
   - Step 5: Select interest tags (Agriculture, Healthcare, etc.)

3. **Homepage** (`/home`):
   - **Eligible tab**: Schemes with ≥60% match score
   - **All tab**: All available schemes
   - Real-time updates when schemes change
   - Click scheme card → view details & apply

### 9.2 Admin Features

Access at `/admin` (requires admin role in `admin_users` table):

- **Dashboard**: User stats and charts
- **Users**: Manage user accounts
- **Schemes**: Create/edit/delete schemes
- **Organizations**: Verify organizations, approve scheme requests
- **Notifications**: Send targeted notifications by state/caste/occupation

### 9.3 Organization Features

Access at `/organization/dashboard` (for verified organizations):

- **Dashboard**: Manage your proposed schemes
- **Onboarding**: Register organization, submit for verification
- **Create Scheme**: Propose new schemes for admin approval

### 9.4 Real-Time Features

- **Supabase Realtime**: Homepage updates when schemes change
- **Convex Notifications**: Instant notification delivery with unread badges

---

## 🐛 Part 10: Troubleshooting

### Build Errors

**Error:** `Cannot find module './_generated/server'`
- **Solution**: Run `npx convex dev` to generate types

**Error:** `Invalid deployment address`
- **Solution**: Check `NEXT_PUBLIC_CONVEX_URL` in `.env.local`

**Error:** `certificate has expired`
- **Solution**: System clock issue or expired Supabase certificate. Verify system date/time.

### Runtime Errors

**Error:** Notification system not working
- **Solution**: 
  1. Verify Convex is running (`npx convex dev`)
  2. Check `NEXT_PUBLIC_CONVEX_URL` is set correctly
  3. Ensure user is authenticated (notifications need userId)

**Error:** OCR not extracting data
- **Solution**:
  1. Check `GEMINI_API_KEY` is valid
  2. Verify image is clear and readable
  3. Check API quotas in Google AI Studio

**Error:** Uploads failing
- **Solution**:
  1. Verify storage buckets exist in Supabase
  2. Check RLS policies allow uploads
  3. Verify `DOCUMENTS_BUCKET` and `FACES_BUCKET` in `.env.local`

### Database Issues

**Error:** Row Level Security (RLS) blocking queries
- **Solution**: 
  1. Ensure user is authenticated
  2. Check RLS policies in Supabase Dashboard → Database → Policies
  3. For admin operations, verify user is in `admin_users` table

---

## 📚 Part 11: Additional Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Convex Docs**: [docs.convex.dev](https://docs.convex.dev)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)

---

## 🎉 Part 12: You're Ready!

Congratulations! Your Citizen Copilot application is now fully set up. Here are your next steps:

1. ✅ Test user registration and onboarding flow
2. ✅ Add yourself as admin and explore admin panel
3. ✅ Create sample schemes to test recommendations
4. ✅ Test notifications from admin panel
5. ✅ Deploy to production (Vercel recommended)

For questions or issues, refer to the troubleshooting section or check the documentation for each service.

**Happy coding! 🚀**
