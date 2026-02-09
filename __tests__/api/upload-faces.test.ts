/**
 * Tests for POST /api/upload/faces
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

import { POST } from "@/app/api/upload/faces/route";

// Small 1-pixel white JPEG in base64
const TINY_IMG =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRof";

describe("POST /api/upload/faces", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const req = makeRequest("http://localhost:3000/api/upload/faces", {
      method: "POST",
      body: { front: TINY_IMG, left: TINY_IMG, right: TINY_IMG },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when images are missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const req = makeRequest("http://localhost:3000/api/upload/faces", {
      method: "POST",
      body: { front: TINY_IMG }, // missing left and right
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("required");
  });

  it("uploads all three faces and updates profile", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    // The profile update query
    const updateQ = createChainableQuery(null, null);
    mockSupabase.from.mockReturnValue(updateQ);

    const req = makeRequest("http://localhost:3000/api/upload/faces", {
      method: "POST",
      body: { front: TINY_IMG, left: TINY_IMG, right: TINY_IMG },
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.urls).toBeDefined();
  });
});
