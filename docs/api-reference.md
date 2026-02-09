# API Reference

All API routes are located under `src/app/api/`. Every route uses Next.js 16 Route Handlers.

---

## Authentication

### `GET /api/auth/callback`

Handles the OAuth callback from Supabase after Google sign-in. Exchanges the authorization code for a session, then redirects based on profile status.

**Query Parameters:**
| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| code      | string | Authorization code from Supabase |

**Redirect Logic:**
- Profile complete → `/home`
- Profile incomplete → `/onboarding`
- Error → `/login?error=...`

---

## Document OCR

### `POST /api/ocr`

Extracts structured data from an uploaded government ID document using Google Gemini AI.

**Headers:** Requires authenticated session (cookie-based).

**Body:** `multipart/form-data`
| Field    | Type   | Description                                     |
|----------|--------|-------------------------------------------------|
| file     | File   | Image of the document (JPEG, PNG, WebP)         |
| doc_type | string | One of: `aadhaar`, `voter_id`, `generic`        |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "full_name": "Raj Kumar",
    "date_of_birth": "15/03/1990",
    "gender": "Male",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "document_number": "1234 5678 9012",
    "father_name": "Suresh Kumar",
    "confidence_score": 0.92
  }
}
```

**Error (401):** `{ "error": "Unauthorized" }`
**Error (500):** `{ "error": "OCR processing failed" }`

---

## Face Upload

### `POST /api/upload/faces`

Uploads face verification images (front, left, right angles) to Supabase Storage.

**Headers:** Requires authenticated session.

**Body:** `application/json`
```json
{
  "front": "data:image/jpeg;base64,...",
  "left": "data:image/jpeg;base64,...",
  "right": "data:image/jpeg;base64,..."
}
```

**Response (200):**
```json
{
  "success": true,
  "urls": {
    "front": "https://proj.supabase.co/storage/v1/object/public/faces/uid/front.jpg",
    "left": "...",
    "right": "..."
  }
}
```

---

## Profile

### `POST /api/profile/complete`

Saves the user's full profile after onboarding (OCR data + additional info + face URLs).

**Headers:** Requires authenticated session.

**Body:** `application/json`
```json
{
  "full_name": "Raj Kumar",
  "date_of_birth": "15/03/1990",
  "gender": "Male",
  "state": "Maharashtra",
  "city": "Mumbai",
  "pincode": "400001",
  "phone": "9876543210",
  "annual_income": 150000,
  "caste_category": "OBC",
  "occupation": "Farmer",
  "is_disabled": false,
  "document_number": "1234 5678 9012",
  "document_type": "aadhaar",
  "face_urls": { "front": "...", "left": "...", "right": "..." }
}
```

**Response (200):**
```json
{ "success": true, "profile": { ... } }
```

---

## Schemes

### `GET /api/schemes`

Returns all active government schemes.

**Headers:** Requires authenticated session.

**Query Parameters:**
| Parameter | Type   | Description               |
|-----------|--------|---------------------------|
| search    | string | Search by name/description |
| category  | string | Filter by category         |

**Response (200):**
```json
{
  "schemes": [
    {
      "id": "uuid",
      "name": "PM-KISAN",
      "slug": "pm-kisan",
      "category": "Agriculture",
      "department": "Ministry of Agriculture",
      "description": "...",
      "benefits": "₹6,000/year",
      "eligibility_rules": { ... },
      "is_active": true
    }
  ]
}
```

### `GET /api/schemes/recommend`

Returns schemes with personalized eligibility scores for the authenticated user.

**Headers:** Requires authenticated session.

**Query Parameters:**
| Parameter | Type   | Description               |
|-----------|--------|---------------------------|
| search    | string | Search by name/description |
| category  | string | Filter by category         |

**Response (200):**
```json
{
  "recommendations": [
    {
      "scheme": { ... },
      "score": 85,
      "matching_criteria": ["age", "income", "state"],
      "missing_criteria": ["caste_category"]
    }
  ]
}
```

---

## Applications

### `POST /api/applications`

Creates a new scheme application for the authenticated user.

**Headers:** Requires authenticated session.

**Body:** `application/json`
```json
{
  "scheme_id": "uuid-of-scheme"
}
```

**Response (200):**
```json
{
  "success": true,
  "application": {
    "id": "uuid",
    "user_id": "uuid",
    "scheme_id": "uuid",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error (409):** `{ "error": "Already applied" }`

---

## Admin

All admin routes require the user to be in the `admin_users` table.

### `GET /api/admin/users`

Returns all user profiles with verification status.

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "full_name": "Raj Kumar",
      "email": "raj@example.com",
      "state": "Maharashtra",
      "is_verified": true,
      "id_verified": true,
      "face_verified": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### `GET /api/admin/schemes`

Returns all schemes (including inactive).

### `POST /api/admin/schemes`

Creates a new scheme.

**Body:** `application/json`
```json
{
  "name": "New Scheme",
  "code": "NS-2024",
  "category": "Healthcare",
  "department": "Ministry of Health",
  "description": "...",
  "benefits": "Free treatments",
  "state": "All India",
  "official_website": "https://example.gov.in",
  "application_process": "Apply online at...",
  "eligibility_rules": {
    "min_age": 18,
    "max_age": 60,
    "max_income": 250000,
    "genders": ["Male", "Female"],
    "caste_categories": ["SC", "ST"],
    "states": ["Maharashtra"],
    "occupations": ["Farmer"],
    "disability_required": false
  }
}
```

### `PUT /api/admin/schemes`

Updates an existing scheme. Same body as POST with additional `id` field.

### `DELETE /api/admin/schemes`

Deactivates a scheme.

**Body:** `application/json`
```json
{ "id": "uuid-of-scheme" }
```

**Response (200):**
```json
{ "success": true }
```
