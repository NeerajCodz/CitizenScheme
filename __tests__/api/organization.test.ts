/**
 * Tests for /api/organization and /api/organization/schemes
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

import { GET as orgGET, POST as orgPOST } from "@/app/api/organization/route";
import {
  GET as schemeGET,
  POST as schemePOST,
} from "@/app/api/organization/schemes/route";

// ─── /api/organization ───

describe("GET /api/organization", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    const res = await orgGET();
    expect(res.status).toBe(401);
  });

  it("returns organization for authenticated user", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const orgQ = createChainableQuery({ id: "org-1", name: "Test Org" });
    mockSupabase.from.mockReturnValueOnce(orgQ);

    const res = await orgGET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.organization).toBeDefined();
  });
});

describe("POST /api/organization", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const req = makeRequest("http://localhost:3000/api/organization", {
      method: "POST",
      body: { name: "Test Org", work_email: "org@test.com" },
    });
    const res = await orgPOST(req);
    expect(res.status).toBe(401);
  });

  it("returns 409 when org already exists", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    // Existing org found
    const existingQ = createChainableQuery({ id: "org-existing" });
    mockSupabase.from.mockReturnValueOnce(existingQ);

    const req = makeRequest("http://localhost:3000/api/organization", {
      method: "POST",
      body: { name: "Test Org", work_email: "org@test.com" },
    });
    const res = await orgPOST(req);
    expect(res.status).toBe(409);
  });

  it("creates organization successfully", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    // No existing org
    const noOrgQ = createChainableQuery(null);
    // Insert returns new org
    const insertQ = createChainableQuery({ id: "org-new", name: "Test Org" });

    mockSupabase.from
      .mockReturnValueOnce(noOrgQ)
      .mockReturnValueOnce(insertQ);

    const req = makeRequest("http://localhost:3000/api/organization", {
      method: "POST",
      body: { name: "Test Org", work_email: "org@test.com" },
    });
    const res = await orgPOST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

// ─── /api/organization/schemes ───

describe("GET /api/organization/schemes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    const res = await schemeGET();
    expect(res.status).toBe(401);
  });

  it("returns 404 when user has no org", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const noOrgQ = createChainableQuery(null);
    mockSupabase.from.mockReturnValueOnce(noOrgQ);

    const res = await schemeGET();
    expect(res.status).toBe(404);
  });

  it("returns scheme requests for org", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const orgQ = createChainableQuery({ id: "org-1" });
    const reqQ = createChainableQuery([]);

    mockSupabase.from
      .mockReturnValueOnce(orgQ)
      .mockReturnValueOnce(reqQ);

    const res = await schemeGET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.requests).toBeDefined();
  });
});

describe("POST /api/organization/schemes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 404 when user has no org", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const noOrgQ = createChainableQuery(null);
    mockSupabase.from.mockReturnValueOnce(noOrgQ);

    const req = makeRequest("http://localhost:3000/api/organization/schemes", {
      method: "POST",
      body: { scheme_name: "Test Scheme" },
    });
    const res = await schemePOST(req);
    expect(res.status).toBe(404);
  });

  it("creates scheme request successfully", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const orgQ = createChainableQuery({ id: "org-1", verified: true });
    const insertQ = createChainableQuery({ id: "req-1", status: "pending" });

    mockSupabase.from
      .mockReturnValueOnce(orgQ)
      .mockReturnValueOnce(insertQ);

    const req = makeRequest("http://localhost:3000/api/organization/schemes", {
      method: "POST",
      body: {
        scheme_name: "New Education Grant",
        description: "Grant for education",
        category: "Education",
      },
    });
    const res = await schemePOST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
