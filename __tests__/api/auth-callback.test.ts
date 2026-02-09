/**
 * Tests for GET /api/auth/callback – OAuth callback handler
 */

import { MOCK_USER, createMockSupabase, createChainableQuery } from "../helpers";

const mockSupabase = createMockSupabase();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({ getAll: () => [], set: jest.fn() })
  ),
}));

import { GET } from "@/app/api/auth/callback/route";
import { NextRequest } from "next/server";

describe("GET /api/auth/callback", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, NODE_ENV: "development" };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("redirects to /login?error=auth_callback_error when no code", async () => {
    const req = new NextRequest(
      new URL("http://localhost:3000/api/auth/callback")
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=auth_callback_error");
  });

  it("exchanges code and redirects to /onboarding for new user", async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValueOnce({
      error: null,
    });
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    // Profile query returns null → new user
    const profileQ = createChainableQuery(null);
    mockSupabase.from.mockReturnValueOnce(profileQ);

    // Insert profile
    const insertQ = createChainableQuery(null, null);
    mockSupabase.from.mockReturnValueOnce(insertQ);

    const req = new NextRequest(
      new URL("http://localhost:3000/api/auth/callback?code=test-code")
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/onboarding");
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      "test-code"
    );
  });

  it("redirects to custom next URL if provided", async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValueOnce({
      error: null,
    });
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    // Profile exists
    const profileQ = createChainableQuery({ id: MOCK_USER.id });
    mockSupabase.from.mockReturnValueOnce(profileQ);

    const req = new NextRequest(
      new URL(
        "http://localhost:3000/api/auth/callback?code=test-code&next=/home"
      )
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/home");
  });

  it("redirects to error page when code exchange fails", async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValueOnce({
      error: new Error("Invalid code"),
    });

    const req = new NextRequest(
      new URL("http://localhost:3000/api/auth/callback?code=bad-code")
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=auth_callback_error");
  });
});
