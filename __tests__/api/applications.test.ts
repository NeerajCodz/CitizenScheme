/// <reference types="jest" />
/**
 * Tests for POST /api/applications and GET /api/applications
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

import { POST, GET } from "@/app/api/applications/route";

describe("POST /api/applications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const req = makeRequest("http://localhost:3000/api/applications", {
      method: "POST",
      body: { scheme_id: "scheme-1" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when scheme_id is missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const req = makeRequest("http://localhost:3000/api/applications", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("scheme_id is required");
  });

  it("returns 409 when already applied", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    // existing application found
    const existingQ = createChainableQuery({ id: "app-existing" });
    mockSupabase.from.mockReturnValueOnce(existingQ);

    const req = makeRequest("http://localhost:3000/api/applications", {
      method: "POST",
      body: { scheme_id: "scheme-1" },
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toContain("already applied");
  });

  it("creates application successfully", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    // No existing application
    const noExistingQ = createChainableQuery(null);
    // Insert returns new application
    const insertQ = createChainableQuery({
      id: "app-new",
      user_id: MOCK_USER.id,
      scheme_id: "scheme-1",
      status: "pending",
    });

    mockSupabase.from
      .mockReturnValueOnce(noExistingQ)
      .mockReturnValueOnce(insertQ);

    const req = makeRequest("http://localhost:3000/api/applications", {
      method: "POST",
      body: { scheme_id: "scheme-1", eligibility_score: 85 },
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.application).toBeDefined();
  });
});

describe("GET /api/applications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns applications for authenticated user", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const appsQ = createChainableQuery([
      { id: "app-1", status: "pending", schemes: {} },
    ]);
    mockSupabase.from.mockReturnValueOnce(appsQ);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.applications).toBeDefined();
    expect(Array.isArray(body.applications)).toBe(true);
  });
});
