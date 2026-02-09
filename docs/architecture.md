# Architecture Overview

## System Architecture

Citizen Copilot follows a modern full-stack architecture:

```
┌─────────────────────────────────┐
│         Client (Browser)        │
│  Next.js App Router + React 19  │
│  shadcn/ui + Tailwind CSS 4     │
│  Framer Motion + react-webcam   │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│      Next.js 16 Server          │
│  proxy.ts (auth routing)        │
│  API Routes (Route Handlers)    │
│  Server Components              │
└──────────┬──────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌──────────┐ ┌──────────┐
│ Supabase │ │  Gemini  │
│ Auth     │ │  AI      │
│ Postgres │ │  (OCR)   │
│ Storage  │ │          │
│ RLS      │ │          │
└──────────┘ └──────────┘
```

## Request Flow

### Authentication Flow
1. User clicks "Continue with Google" on `/login`
2. Supabase redirects to Google OAuth consent
3. Google redirects back to `/api/auth/callback` with code
4. Server exchanges code for session tokens
5. proxy.ts intercepts all requests:
   - Unauthenticated → redirect to `/login`
   - Authenticated + no profile → redirect to `/onboarding`
   - Authenticated + complete profile → allow through
   - Admin routes → verify `admin_users` table

### Onboarding Flow
1. **Document Upload** → `POST /api/ocr`
   - File uploaded to Supabase Storage (`documents/{user_id}/`)
   - Image sent to Gemini 1.5 Flash with document-specific prompt
   - Extracted data returned to client
2. **Profile Review** → Client-side editing of OCR data
3. **Additional Info** → Client collects income, caste, occupation
4. **Face Verification** → `POST /api/upload/faces`
   - 3 images (front/left/right) sent as base64
   - Converted to buffers and uploaded to `face-verification/{user_id}/`
5. **Profile Complete** → `POST /api/profile/complete`
   - Saves all fields and marks `onboarding_completed = true`

### Recommendation Flow
1. `GET /api/schemes/recommend` fetches user profile + all active schemes
2. Each scheme's JSONB `eligibility_rules` are checked against user profile
3. For each rule criterion (age, income, gender, etc.):
   - Match → criterion added to `matching_criteria`
   - No match → added to `missing_criteria`
4. Score = (matching / total criteria) × 100
5. Results sorted by score, returned with full breakdown

## Data Architecture

### Supabase Tables
- **user_profiles**: 1:1 with auth.users, stores all citizen data
- **schemes**: Indexed by slug, category, state; JSONB eligibility_rules
- **scheme_applications**: Junction table with unique(user_id, scheme_id)
- **admin_users**: Role-based access ('admin' | 'super_admin')

### Row-Level Security
Every table has RLS enabled. Policies enforce:
- Users read/write only their own data
- Admins can read all user data
- Super admins manage admin_users
- Authenticated users can read active schemes

### Storage Buckets
- **documents**: 5MB limit, images + PDF, per-user folder isolation
- **face-verification**: 2MB limit, images only, per-user folder isolation

## Technology Choices

| Choice | Reason |
|--------|--------|
| Next.js 16 | App Router + proxy.ts for auth, Turbopack for fast dev |
| Supabase | Auth + DB + Storage + RLS in one platform |
| Gemini 1.5 Flash | Best price/performance for document OCR |
| shadcn/ui | Accessible, customizable, tree-shakeable |
| Rule-based scoring | Deterministic, transparent, no ML overhead |
| JSONB eligibility_rules | Flexible per-scheme criteria without schema changes |
