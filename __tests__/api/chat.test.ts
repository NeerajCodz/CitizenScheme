/**
 * Tests for Chat endpoints:
 *   GET    /api/chat          – Get or create chat thread
 *   POST   /api/chat          – Send a message
 *   DELETE /api/chat           – Reset conversation
 *   POST   /api/chat/documents – Upload document to thread
 *   GET    /api/chat/documents – List / status check
 */

import {
  MOCK_USER,
  MOCK_PROFILE,
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

// ─── Backboard mocks ───
const mockCreateThread = jest.fn().mockResolvedValue({
  thread_id: "thread-new",
  messages: [],
});
const mockGetThread = jest.fn().mockResolvedValue({
  thread_id: "thread-123",
  messages: [{ role: "assistant", content: "Hello!" }],
});
const mockSendMessage = jest.fn().mockResolvedValue({
  message_id: "msg-1",
  content: "Response from AI",
  role: "assistant",
  attachments: [],
  retrieved_memories: [],
  retrieved_files: [],
  created_at: "2025-01-01T00:00:00Z",
});
const mockAddMemory = jest.fn().mockResolvedValue(undefined);
const mockDeleteThread = jest.fn().mockResolvedValue(undefined);
const mockUploadDocumentToThread = jest.fn().mockResolvedValue({
  document_id: "doc-1",
  filename: "test.pdf",
  status: "processing",
});
const mockGetDocumentStatus = jest.fn().mockResolvedValue({
  document_id: "doc-1",
  status: "completed",
});
const mockListThreadDocuments = jest.fn().mockResolvedValue([
  { document_id: "doc-1", filename: "test.pdf", status: "completed" },
]);

jest.mock("@/lib/backboard", () => ({
  createThread: (...args: unknown[]) => mockCreateThread(...args),
  getThread: (...args: unknown[]) => mockGetThread(...args),
  sendMessage: (...args: unknown[]) => mockSendMessage(...args),
  addMemory: (...args: unknown[]) => mockAddMemory(...args),
  deleteThread: (...args: unknown[]) => mockDeleteThread(...args),
  uploadDocumentToThread: (...args: unknown[]) =>
    mockUploadDocumentToThread(...args),
  getDocumentStatus: (...args: unknown[]) => mockGetDocumentStatus(...args),
  listThreadDocuments: (...args: unknown[]) =>
    mockListThreadDocuments(...args),
}));

// ─── Imports ───
import { GET as chatGET, POST as chatPOST, DELETE as chatDELETE } from "@/app/api/chat/route";
import {
  POST as chatDocsPOST,
  GET as chatDocsGET,
} from "@/app/api/chat/documents/route";

// ════════════════════════════════════════════════
// /api/chat
// ════════════════════════════════════════════════

describe("GET /api/chat", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    const res = await chatGET();
    expect(res.status).toBe(401);
  });

  it("returns existing thread with messages", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });
    const profileQ = createChainableQuery({
      ...MOCK_PROFILE,
      chatbot_thread_id: "thread-123",
    });
    mockSupabase.from.mockReturnValueOnce(profileQ);

    const res = await chatGET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.thread_id).toBe("thread-123");
    expect(body.messages).toHaveLength(1);
    expect(mockGetThread).toHaveBeenCalledWith("thread-123");
  });

  it("creates new thread when profile has no thread_id", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });
    const profileQ = createChainableQuery({
      ...MOCK_PROFILE,
      chatbot_thread_id: null,
    });
    mockSupabase.from.mockReturnValueOnce(profileQ);

    // The route will call from("user_profiles").update()...
    const updateQ = createChainableQuery(null, null);
    mockSupabase.from.mockReturnValueOnce(updateQ);

    const res = await chatGET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.thread_id).toBe("thread-new");
    expect(mockCreateThread).toHaveBeenCalled();
  });
});

describe("POST /api/chat", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    const req = makeRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: { content: "Hello", thread_id: "t1" },
    });
    const res = await chatPOST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when thread_id is missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });
    const req = makeRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: { content: "Hello" },
    });
    const res = await chatPOST(req);
    expect(res.status).toBe(400);
  });

  it("sends a message and returns response", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });
    const profileQ = createChainableQuery(MOCK_PROFILE);
    mockSupabase.from.mockReturnValueOnce(profileQ);

    const req = makeRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: { content: "Tell me about schemes", thread_id: "thread-123" },
    });
    const res = await chatPOST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.content).toBe("Response from AI");
    expect(body.role).toBe("assistant");
    expect(mockSendMessage).toHaveBeenCalled();
  });
});

describe("DELETE /api/chat", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    const res = await chatDELETE();
    expect(res.status).toBe(401);
  });

  it("resets conversation and returns new thread", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });
    const profileQ = createChainableQuery({
      chatbot_thread_id: "thread-old",
    });
    mockSupabase.from.mockReturnValueOnce(profileQ);

    // Update call
    const updateQ = createChainableQuery(null, null);
    mockSupabase.from.mockReturnValueOnce(updateQ);

    const res = await chatDELETE();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.thread_id).toBe("thread-new");
    expect(mockCreateThread).toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════
// /api/chat/documents
// ════════════════════════════════════════════════

describe("POST /api/chat/documents", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    const fd = new FormData();
    fd.append("thread_id", "t1");
    fd.append("file", new Blob(["test"]), "test.pdf");
    const req = makeRequest("http://localhost:3000/api/chat/documents", {
      method: "POST",
      body: fd,
    });
    const res = await chatDocsPOST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file provided", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });
    const fd = new FormData();
    fd.append("thread_id", "t1");
    const req = makeRequest("http://localhost:3000/api/chat/documents", {
      method: "POST",
      body: fd,
    });
    const res = await chatDocsPOST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/chat/documents", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    const req = makeRequest(
      "http://localhost:3000/api/chat/documents?thread_id=t1"
    );
    const res = await chatDocsGET(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when no thread_id or document_id", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });
    const req = makeRequest("http://localhost:3000/api/chat/documents");
    const res = await chatDocsGET(req);
    expect(res.status).toBe(400);
  });

  it("returns document status when document_id given", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });
    const req = makeRequest(
      "http://localhost:3000/api/chat/documents?document_id=doc-1"
    );
    const res = await chatDocsGET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.document_id).toBe("doc-1");
    expect(body.status).toBe("completed");
  });

  it("lists thread documents when thread_id given", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: MOCK_USER },
      error: null,
    });
    const req = makeRequest(
      "http://localhost:3000/api/chat/documents?thread_id=thread-123"
    );
    const res = await chatDocsGET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].document_id).toBe("doc-1");
  });
});
