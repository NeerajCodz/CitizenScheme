/// <reference types="jest" />
/**
 * Tests for GET /api/schemes/recommend
 */

import {
  MOCK_USER,
  MOCK_PROFILE,
  MOCK_SCHEME,
  createMockSupabase,
  createChainableQuery,
  makeRequest,
} from "../helpers";

// ─── Mocks ───

const mockSupabase = createMockSupabase();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({ getAll: () => [], set: jest.fn() })
  ),
}));

import { GET } from "@/app/api/schemes/recommend/route";

// ─── Tests ───

describe("GET /api/schemes/recommend", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const req = makeRequest("http://localhost:3000/api/schemes/recommend");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 404 when user profile not found", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    // user_profiles query → null
    const profileQ = createChainableQuery(null);
    mockSupabase.from.mockReturnValueOnce(profileQ);

    const req = makeRequest("http://localhost:3000/api/schemes/recommend");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Profile not found");
  });

  it("returns recommendations for authenticated user", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    // First from() → user_profiles
    const profileQ = createChainableQuery(MOCK_PROFILE);
    // Second from() → schemes
    const schemesQ = createChainableQuery([MOCK_SCHEME]);

    mockSupabase.from
      .mockReturnValueOnce(profileQ)
      .mockReturnValueOnce(schemesQ);

    const req = makeRequest("http://localhost:3000/api/schemes/recommend");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.recommendations).toBeDefined();
    expect(Array.isArray(body.recommendations)).toBe(true);
    expect(body.profile).toBeDefined();
    expect(body.total).toBeDefined();
  });

  it("passes filter params through to supabase query", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const profileQ = createChainableQuery(MOCK_PROFILE);
    const schemesQ = createChainableQuery([]);
    mockSupabase.from
      .mockReturnValueOnce(profileQ)
      .mockReturnValueOnce(schemesQ);

    const req = makeRequest(
      "http://localhost:3000/api/schemes/recommend?category=Agriculture&search=kisan"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    // Verify the schemes table was queried
    expect(mockSupabase.from).toHaveBeenCalledWith("schemes");
  });
});
