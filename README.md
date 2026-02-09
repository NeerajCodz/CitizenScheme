# Citizen Copilot

> AI-powered platform that discovers eligible government welfare schemes for Indian citizens.

Upload your ID → Verify your identity → Get personalized benefit recommendations — in minutes.

## Features

- **AI-Powered OCR** — Extracts details from Aadhaar, Voter ID, and other government IDs using Google Gemini Vision
- **Face Verification** — 3-angle selfie capture (front, left, right) for identity verification
- **Smart Recommendations** — Rule-based eligibility scoring matches users to welfare schemes
- **Admin Panel** — Manage schemes, view user profiles, monitor applications
- **10+ Seeded Schemes** — National and state-level schemes (PM-KISAN, Ayushman Bharat, PM Awas, etc.)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| UI | shadcn/ui + Tailwind CSS 4 + Framer Motion |
| Auth & DB | Supabase (Auth, PostgreSQL, Storage, RLS) |
| AI/OCR | Google Gemini 1.5 Flash |
| Camera | react-webcam |
| Package Manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- [Supabase](https://supabase.com) project
- [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone & Install

```bash
git clone <repo-url> CitizenScheme
cd CitizenScheme
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `GEMINI_API_KEY` | Google Gemini API key |

### 3. Database Setup

Run the migration SQL files in order against your Supabase project:

```bash
# Via Supabase Dashboard → SQL Editor, run each file in order:
supabase/migrations/001_create_tables.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_storage_buckets.sql
supabase/migrations/004_seed_schemes.sql
```

Or with the Supabase CLI:

```bash
supabase db push
```

### 4. Supabase Auth Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Google** provider
3. Add your Google OAuth client ID and secret
4. Set redirect URL to: `http://localhost:3000/api/auth/callback`

### 5. Make Yourself Admin

After signing in for the first time, run this SQL in Supabase SQL Editor:

```sql
INSERT INTO admin_users (id, role) VALUES ('<your-user-uuid>', 'super_admin');
```

### 6. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (Inter font, Sonner)
│   ├── globals.css                 # Theme & Tailwind config
│   ├── login/page.tsx              # Google OAuth login
│   ├── onboarding/page.tsx         # 4-step onboarding wizard
│   ├── home/page.tsx               # Scheme recommendations
│   ├── scheme/[slug]/page.tsx      # Scheme detail + apply
│   ├── admin/
│   │   ├── layout.tsx              # Admin sidebar layout
│   │   ├── page.tsx                # Dashboard stats
│   │   ├── users/page.tsx          # User management
│   │   └── schemes/
│   │       ├── page.tsx            # Scheme list + deactivate
│   │       └── new/page.tsx        # Create/edit scheme form
│   └── api/
│       ├── auth/callback/route.ts  # OAuth callback handler
│       ├── ocr/route.ts            # Gemini OCR processing
│       ├── upload/faces/route.ts   # Face image upload
│       ├── profile/complete/route.ts # Profile completion
│       ├── schemes/
│       │   ├── route.ts            # List active schemes
│       │   └── recommend/route.ts  # Personalized recommendations
│       ├── applications/route.ts   # Apply + list applications
│       └── admin/
│           ├── schemes/route.ts    # Admin CRUD for schemes
│           └── users/route.ts      # Admin: list all users
├── components/
│   ├── ui/                         # shadcn/ui components (15)
│   └── verification/
│       └── FaceCapture.tsx         # Webcam face capture
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── utils.ts                    # cn(), formatDate, etc.
│   ├── gemini.ts                   # Gemini OCR prompts
│   ├── recommendation.ts           # Eligibility scoring engine
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client
│       └── proxy.ts                # Session management
└── proxy.ts                        # Next.js 16 proxy (auth routing)
supabase/
└── migrations/
    ├── 001_create_tables.sql       # Tables, indexes, triggers
    ├── 002_rls_policies.sql        # Row-level security
    ├── 003_storage_buckets.sql     # Storage buckets + policies
    └── 004_seed_schemes.sql        # 10 sample schemes
```

## User Flow

```
Landing (/) → Login (/login) → OAuth callback → Onboarding (/onboarding)
  Step 1: Upload ID document
  Step 2: Review OCR-extracted data
  Step 3: Additional info (income, caste, occupation)
  Step 4: Face verification (3 angles)
→ Home (/home) — Personalized scheme cards
→ Scheme Detail (/scheme/[slug]) — Full info + apply
```

## Admin Flow

```
/admin — Dashboard with stats
/admin/users — User list with search & filters
/admin/schemes — Scheme management (view, edit, deactivate)
/admin/schemes/new — Create or edit schemes with eligibility rules
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/auth/callback` | OAuth code exchange |
| POST | `/api/ocr` | Document OCR with Gemini |
| POST | `/api/upload/faces` | Upload 3 face images |
| POST | `/api/profile/complete` | Save profile & complete onboarding |
| GET | `/api/schemes` | List active schemes |
| GET | `/api/schemes/recommend` | Personalized recommendations |
| GET/POST | `/api/applications` | List/create applications |
| GET/POST/PUT/DELETE | `/api/admin/schemes` | Admin scheme CRUD |
| GET | `/api/admin/users` | Admin: list all users |

## Database Schema

### user_profiles
Stores citizen data — personal info, OCR-extracted fields, verification status, document/face URLs.

### schemes
Government welfare schemes with JSONB `eligibility_rules` for age, income, gender, caste, state, occupation, disability criteria.

### scheme_applications
Tracks user applications with eligibility scores and review status.

### admin_users
Admin access control with `admin` and `super_admin` roles.

## Recommendation Engine

The recommendation engine in `src/lib/recommendation.ts` uses rule-based scoring:

1. Extracts eligibility rules from each scheme's JSONB config
2. Checks each criterion (age, income, gender, caste, state, occupation, disability)
3. Calculates a percentage match score
4. Returns sorted results with matching/missing criteria breakdown

## Security

- **Row-Level Security (RLS)** on all Supabase tables
- Users can only access their own profiles and applications
- Admin routes verify `admin_users` table membership
- Storage buckets have per-user folder isolation
- Face verification images stored in separate restricted bucket
- Service role key only used server-side

## Scripts

```bash
pnpm dev        # Start dev server (Turbopack)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # ESLint check
```

## License

MIT
