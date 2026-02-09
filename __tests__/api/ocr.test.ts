/**
 * Tests for POST /api/ocr
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

// Mock Backboard's extractDocumentData
const mockExtract = jest.fn();
jest.mock("@/lib/backboard", () => ({
  extractDocumentData: (...args: unknown[]) => mockExtract(...args),
}));

import { POST } from "@/app/api/ocr/route";

const TINY_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk";

describe("POST /api/ocr", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const req = makeRequest("http://localhost:3000/api/ocr", {
      method: "POST",
      body: { image: TINY_BASE64 },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when no image provided (JSON body)", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    const req = makeRequest("http://localhost:3000/api/ocr", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("No image");
  });

  it("returns 422 when OCR fails", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    mockExtract.mockResolvedValueOnce({
      success: false,
      error: "Unreadable image",
    });

    const req = makeRequest("http://localhost:3000/api/ocr", {
      method: "POST",
      body: { image: TINY_BASE64, documentType: "aadhaar" },
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
  });

  it("processes OCR successfully and updates profile", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });

    mockExtract.mockResolvedValueOnce({
      success: true,
      data: {
        full_name: "Rahul Kumar",
        document_number: "1234 5678 9012",
        date_of_birth: "15/06/1990",
        gender: "Male",
        father_or_husband_name: "Suresh Kumar",
        address: {
          line1: "123 Main St",
          line2: null,
          city: "Delhi",
          district: "Central Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const updateQ = createChainableQuery(null, null);
    mockSupabase.from.mockReturnValue(updateQ);

    const req = makeRequest("http://localhost:3000/api/ocr", {
      method: "POST",
      body: { image: TINY_BASE64, documentType: "aadhaar" },
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.full_name).toBe("Rahul Kumar");
    expect(mockExtract).toHaveBeenCalledWith(
      TINY_BASE64,
      "image/jpeg",
      "aadhaar"
    );
  });
});
