/**
 * Tests for Admin endpoints:
 *   GET  /api/admin/users
 *   GET  /api/admin/schemes
 *   POST /api/admin/schemes
 *   PUT  /api/admin/schemes
 *   DELETE /api/admin/schemes
 *   GET  /api/admin/organizations
 *   PUT  /api/admin/organizations
 *   PATCH /api/admin/organizations
 *   POST /api/admin/notifications
 */

import {
  MOCK_ADMIN_USER,
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

// Mock Convex
jest.mock("convex/browser", () => ({
  ConvexHttpClient: jest.fn().mockImplementation(() => ({
    mutation: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock("../../../../convex/_generated/api", () => ({
  api: { notifications: { sendBulk: "notifications:sendBulk" } },
}), { virtual: true });

// ─── Admin helpers per-file mock admin check ───
// Each admin route has its own isAdmin that checks admin_users table.
// We need to mock the Supabase from() chain for "admin_users".

function setupAdminAuth(isAdmin: boolean) {
  mockSupabase.auth.getUser.mockResolvedValueOnce({
    data: { user: isAdmin ? MOCK_ADMIN_USER : MOCK_USER },
    error: null,
  });

  // The isAdmin() function inside each route calls from("admin_users").select("id").eq("id", userId).single()
  const adminQ = createChainableQuery(
    isAdmin ? { id: MOCK_ADMIN_USER.id } : null
  );
  mockSupabase.from.mockReturnValueOnce(adminQ);
}

// ─── /api/admin/users ───

import { GET as adminUsersGET } from "@/app/api/admin/users/route";

describe("GET /api/admin/users", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 403 for non-admin user", async () => {
    setupAdminAuth(false);
    const res = await adminUsersGET();
    expect(res.status).toBe(403);
  });

  it("returns users list for admin", async () => {
    setupAdminAuth(true);

    const usersQ = createChainableQuery([
      { id: "user-1", full_name: "User One" },
    ]);
    mockSupabase.from.mockReturnValueOnce(usersQ);

    const res = await adminUsersGET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.users).toBeDefined();
  });
});

// ─── /api/admin/schemes ───

import {
  GET as adminSchemesGET,
  POST as adminSchemesPOST,
  PUT as adminSchemesPUT,
  DELETE as adminSchemesDELETE,
} from "@/app/api/admin/schemes/route";

describe("GET /api/admin/schemes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 403 for non-admin", async () => {
    setupAdminAuth(false);
    const res = await adminSchemesGET();
    expect(res.status).toBe(403);
  });

  it("returns all schemes for admin", async () => {
    setupAdminAuth(true);
    const schemesQ = createChainableQuery([{ id: "s1", scheme_name: "Test" }]);
    mockSupabase.from.mockReturnValueOnce(schemesQ);

    const res = await adminSchemesGET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.schemes).toBeDefined();
  });
});

describe("POST /api/admin/schemes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 403 for non-admin", async () => {
    setupAdminAuth(false);
    const req = makeRequest("http://localhost:3000/api/admin/schemes", {
      method: "POST",
      body: { scheme_name: "Test", scheme_code: "TST" },
    });
    const res = await adminSchemesPOST(req);
    expect(res.status).toBe(403);
  });

  it("creates a scheme for admin", async () => {
    setupAdminAuth(true);
    const insertQ = createChainableQuery({
      id: "new-scheme",
      scheme_name: "New Scheme",
      slug: "new-scheme",
    });
    mockSupabase.from.mockReturnValueOnce(insertQ);

    const req = makeRequest("http://localhost:3000/api/admin/schemes", {
      method: "POST",
      body: {
        scheme_name: "New Scheme",
        scheme_code: "NS001",
        description: "A new scheme",
        benefits: "Free education",
        department: "Education",
        category: "Education",
      },
    });
    const res = await adminSchemesPOST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe("PUT /api/admin/schemes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when id is missing", async () => {
    setupAdminAuth(true);

    const req = makeRequest("http://localhost:3000/api/admin/schemes", {
      method: "PUT",
      body: { scheme_name: "Updated" },
    });
    const res = await adminSchemesPUT(req);
    expect(res.status).toBe(400);
  });

  it("updates a scheme for admin", async () => {
    setupAdminAuth(true);
    const updateQ = createChainableQuery({
      id: "scheme-1",
      scheme_name: "Updated Scheme",
    });
    mockSupabase.from.mockReturnValueOnce(updateQ);

    const req = makeRequest("http://localhost:3000/api/admin/schemes", {
      method: "PUT",
      body: { id: "scheme-1", scheme_name: "Updated Scheme" },
    });
    const res = await adminSchemesPUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe("DELETE /api/admin/schemes", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when id is missing", async () => {
    setupAdminAuth(true);

    const req = makeRequest("http://localhost:3000/api/admin/schemes", {
      method: "DELETE",
      body: {},
    });
    const res = await adminSchemesDELETE(req);
    expect(res.status).toBe(400);
  });

  it("soft-deletes a scheme for admin", async () => {
    setupAdminAuth(true);
    const deleteQ = createChainableQuery(null, null);
    mockSupabase.from.mockReturnValueOnce(deleteQ);

    const req = makeRequest("http://localhost:3000/api/admin/schemes", {
      method: "DELETE",
      body: { id: "scheme-1" },
    });
    const res = await adminSchemesDELETE(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

// ─── /api/admin/organizations ───

import {
  GET as adminOrgsGET,
  PUT as adminOrgsPUT,
  PATCH as adminOrgsPATCH,
} from "@/app/api/admin/organizations/route";

describe("GET /api/admin/organizations", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 403 for non-admin", async () => {
    setupAdminAuth(false);
    const res = await adminOrgsGET();
    expect(res.status).toBe(403);
  });

  it("returns orgs and requests for admin", async () => {
    setupAdminAuth(true);

    // Two parallel queries: organizations + org_scheme_requests
    const orgsQ = createChainableQuery([{ id: "org-1", name: "Org" }]);
    const reqsQ = createChainableQuery([]);

    mockSupabase.from
      .mockReturnValueOnce(orgsQ)
      .mockReturnValueOnce(reqsQ);

    const res = await adminOrgsGET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.organizations).toBeDefined();
    expect(body.requests).toBeDefined();
  });
});

describe("PUT /api/admin/organizations", () => {
  beforeEach(() => jest.clearAllMocks());

  it("verifies an org for admin", async () => {
    setupAdminAuth(true);
    const updateQ = createChainableQuery(null, null);
    mockSupabase.from.mockReturnValueOnce(updateQ);

    const req = makeRequest("http://localhost:3000/api/admin/organizations", {
      method: "PUT",
      body: { id: "org-1", verified: true },
    });
    const res = await adminOrgsPUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe("PATCH /api/admin/organizations", () => {
  beforeEach(() => jest.clearAllMocks());

  it("approves a scheme request and creates scheme", async () => {
    setupAdminAuth(true);

    // First: update org_scheme_requests
    const updateReqQ = createChainableQuery(null, null);
    // Second: fetch scheme_data for the approved request
    const fetchQ = createChainableQuery({
      scheme_data: {
        scheme_name: "Approved Scheme",
        description: "Desc",
        department: "Dept",
      },
      org_id: "org-1",
    });
    // Third: insert into schemes
    const insertQ = createChainableQuery(null, null);

    mockSupabase.from
      .mockReturnValueOnce(updateReqQ)
      .mockReturnValueOnce(fetchQ)
      .mockReturnValueOnce(insertQ);

    const req = makeRequest("http://localhost:3000/api/admin/organizations", {
      method: "PATCH",
      body: {
        requestId: "req-1",
        status: "approved",
        admin_notes: "Looks good",
      },
    });
    const res = await adminOrgsPATCH(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

// ─── /api/admin/notifications ───
// Requires fixing the import path for convex api

import { POST as adminNotifyPOST } from "@/app/api/admin/notifications/route";

describe("POST /api/admin/notifications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 403 for non-admin", async () => {
    setupAdminAuth(false);
    const req = makeRequest("http://localhost:3000/api/admin/notifications", {
      method: "POST",
      body: { title: "Test", message: "Hello" },
    });
    const res = await adminNotifyPOST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 when title or message missing", async () => {
    setupAdminAuth(true);

    const req = makeRequest("http://localhost:3000/api/admin/notifications", {
      method: "POST",
      body: { title: "" },
    });
    const res = await adminNotifyPOST(req);
    expect(res.status).toBe(400);
  });
});
