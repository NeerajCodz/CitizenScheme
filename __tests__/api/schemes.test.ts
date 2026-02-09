/// <reference types="jest" />
/**
 * Tests for GET /api/schemes
 */

import {
  MOCK_USER,
  MOCK_SCHEME,
  createMockSupabase,
  createChainableQuery,
} from "../helpers";

// ─── Mocks ───

const mockSupabase = createMockSupabase();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      getAll: () => [],
      set: jest.fn(),
    })
  ),
}));

// ─── Import after mocks ───

import { GET } from "@/app/api/schemes/route";

// ─── Tests ───

describe("GET /api/schemes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns schemes list for authenticated user", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const schemesQuery = createChainableQuery([MOCK_SCHEME]);
    mockSupabase.from.mockReturnValueOnce(schemesQuery);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.schemes).toBeDefined();
    expect(mockSupabase.from).toHaveBeenCalledWith("schemes");
  });

  it("returns 500 when supabase query fails", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const failQuery = createChainableQuery(null, { message: "DB error" });
    mockSupabase.from.mockReturnValueOnce(failQuery);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to fetch schemes");
  });
});
