/**
 * Tests for POST /api/profile/complete
 */

import {
  MOCK_USER,
  createMockSupabase,
  createChainableQuery,
  makeRequest,
} from "../helpers";

const mockSupabase = createMockSupabase();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({ getAll: () => [], set: jest.fn() })
  ),
}));

import { POST } from "@/app/api/profile/complete/route";

describe("POST /api/profile/complete", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const req = makeRequest("http://localhost:3000/api/profile/complete", {
      method: "POST",
      body: { annual_income: 200000 },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("completes profile successfully", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const updateQ = createChainableQuery(null, null);
    mockSupabase.from.mockReturnValueOnce(updateQ);

    const req = makeRequest("http://localhost:3000/api/profile/complete", {
      method: "POST",
      body: {
        annual_income: 200000,
        caste_category: "OBC",
        occupation: "Student",
        phone: "9876543210",
        interested_tags: ["education"],
      },
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 500 when update fails", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const failQ = createChainableQuery(null, { message: "DB error" });
    mockSupabase.from.mockReturnValueOnce(failQ);

    const req = makeRequest("http://localhost:3000/api/profile/complete", {
      method: "POST",
      body: { annual_income: 200000 },
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
