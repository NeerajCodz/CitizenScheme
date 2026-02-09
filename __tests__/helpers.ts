// ─── Shared Mock Factories for API Route Tests ───

import { NextRequest } from "next/server";

// ─── Mock User ───
export const MOCK_USER = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: {
    full_name: "Test User",
    avatar_url: null,
  },
};

export const MOCK_ADMIN_USER = {
  id: "admin-456",
  email: "admin@example.com",
  user_metadata: { full_name: "Admin User" },
};

// ─── Mock Profile ───
export const MOCK_PROFILE = {
  id: "user-123",
  email: "test@example.com",
  full_name: "Test User",
  phone: "9876543210",
  avatar_url: null,
  aadhaar_number: null,
  voter_id: null,
  date_of_birth: "15/06/1990",
  gender: "Male",
  address: {
    line1: "123 Test Street",
    line2: null,
    city: "Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  },
  id_verified: true,
  face_verified: true,
  onboarding_completed: true,
  annual_income: 300000,
  caste_category: "General",
  disability_status: "none",
  occupation: "Student",
  state: "Maharashtra",
  id_document_url: null,
  face_front_url: null,
  face_left_url: null,
  face_right_url: null,
  interested_tags: ["education", "health"],
  chatbot_thread_id: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

// ─── Mock Scheme ───
export const MOCK_SCHEME = {
  id: "scheme-1",
  slug: "pm-kisan",
  scheme_name: "PM Kisan Samman Nidhi",
  scheme_code: "PMKSN",
  description: "Income support for farmers",
  benefits: "₹6000 per year",
  department: "Ministry of Agriculture",
  state: null,
  eligibility_rules: {
    occupation: ["Farmer"],
    income: { max: 200000 },
  },
  application_process: "Apply through portal",
  official_website: "https://pmkisan.gov.in",
  is_active: true,
  category: "Agriculture",
  icon: null,
  created_by: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

// ─── Supabase Mock Builder ───

type ChainableQuery = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  or: jest.Mock;
  in: jest.Mock;
  order: jest.Mock;
  single: jest.Mock;
  then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => void;
  limit: jest.Mock;
  range: jest.Mock;
  ilike: jest.Mock;
  neq: jest.Mock;
  gte: jest.Mock;
  lte: jest.Mock;
};

export function createChainableQuery(
  resolveData: unknown = null,
  resolveError: unknown = null
): ChainableQuery {
  const result = { data: resolveData, error: resolveError };

  const chain: ChainableQuery = {} as ChainableQuery;

  // Make the chain itself thenable so `await chain` works
  chain.then = (resolve: (v: unknown) => void) => resolve(result);

  // All chainable methods return the chain
  const chainableMethods = [
    "select", "insert", "update", "delete",
    "eq", "or", "in", "order",
    "limit", "range", "ilike", "neq", "gte", "lte",
  ] as const;

  for (const method of chainableMethods) {
    (chain as Record<string, unknown>)[method] = jest.fn().mockReturnValue(chain);
  }

  // .single() returns a promise (not the chain)
  chain.single = jest.fn().mockResolvedValue(result);

  return chain;
}

export function createMockSupabase(overrides?: {
  user?: typeof MOCK_USER | null;
  tables?: Record<string, ChainableQuery>;
}) {
  const user = overrides?.user === undefined ? MOCK_USER : overrides.user;
  const tables = overrides?.tables || {};

  const defaultQuery = createChainableQuery(null, null);

  const storage = {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: "https://test.supabase.co/storage/test.jpg" },
      }),
    }),
  };

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
      exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn((table: string) => {
      return tables[table] || defaultQuery;
    }),
    storage,
  };
}

// ─── NextRequest Builder ───

export function makeRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  }
): NextRequest {
  const { method = "GET", body, headers: hdrs = {} } = options || {};

  const init: Record<string, unknown> = { method, headers: hdrs };

  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      if (!hdrs["content-type"]) {
        (init.headers as Record<string, string>)["content-type"] =
          "application/json";
      }
    }
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), init as never);
}
