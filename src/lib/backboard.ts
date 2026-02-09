// ─── Backboard.io API Client ───
// Replaces Gemini for OCR, document processing, and powers the chatbot.

const BACKBOARD_BASE_URL = "https://app.backboard.io/api";
const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY!;
const BACKBOARD_ASSISTANT_ID = process.env.BACKBOARD_ASSISTANT_ID!;

// ─── Types ───

export interface BackboardThread {
  thread_id: string;
  created_at: string;
  metadata_?: Record<string, unknown>;
  messages: BackboardMessage[];
}

export interface BackboardMessage {
  message_id: string;
  thread_id: string;
  content: string;
  role: "user" | "assistant";
  status: string;
  run_id?: string;
  memory_operation_id?: string;
  retrieved_memories?: { id: string; memory: string; score: number }[];
  retrieved_files?: string[];
  model_provider?: string;
  model_name?: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  created_at: string;
  timestamp?: string;
  attachments?: BackboardAttachment[];
  tool_calls?: Record<string, unknown>[];
}

export interface BackboardAttachment {
  document_id: string;
  filename: string;
  status: string;
  file_size_bytes?: number;
  summary?: string;
}

export interface BackboardDocument {
  document_id: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "error";
  status_message?: string;
  summary?: string;
  metadata_?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BackboardMemory {
  id: string;
  memory: string;
  score: number;
}

// ─── Headers ───

function headers(): Record<string, string> {
  return {
    "X-API-Key": BACKBOARD_API_KEY,
  };
}

function jsonHeaders(): Record<string, string> {
  return {
    "X-API-Key": BACKBOARD_API_KEY,
    "Content-Type": "application/json",
  };
}

// ─── Assistant ───

export async function getAssistant() {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/assistants/${BACKBOARD_ASSISTANT_ID}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Failed to get assistant: ${res.statusText}`);
  return res.json();
}

// ─── Threads ───

export async function createThread(
  metadata?: Record<string, unknown>
): Promise<BackboardThread> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/assistants/${BACKBOARD_ASSISTANT_ID}/threads`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(metadata ? { metadata_: metadata } : {}),
    }
  );
  if (!res.ok) throw new Error(`Failed to create thread: ${res.statusText}`);
  return res.json();
}

export async function getThread(threadId: string): Promise<BackboardThread> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/threads/${threadId}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Failed to get thread: ${res.statusText}`);
  return res.json();
}

export async function deleteThread(threadId: string): Promise<void> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/threads/${threadId}`,
    { method: "DELETE", headers: headers() }
  );
  if (!res.ok) throw new Error(`Failed to delete thread: ${res.statusText}`);
}

export async function listThreads(
  skip = 0,
  limit = 100
): Promise<BackboardThread[]> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/threads?skip=${skip}&limit=${limit}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Failed to list threads: ${res.statusText}`);
  return res.json();
}

// ─── Messages ───

export interface SendMessageOptions {
  content: string;
  threadId: string;
  files?: File[];
  memory?: "Auto" | "off" | "Readonly";
  stream?: boolean;
  webSearch?: "Auto" | "off";
  llmProvider?: string;
  modelName?: string;
  sendToLlm?: boolean;
  metadata?: Record<string, unknown>;
}

export async function sendMessage(
  opts: SendMessageOptions
): Promise<BackboardMessage> {
  const formData = new FormData();
  formData.append("content", opts.content);
  formData.append("stream", String(opts.stream ?? false));
  formData.append("memory", opts.memory ?? "Auto");
  formData.append("web_search", opts.webSearch ?? "off");
  formData.append("send_to_llm", String(opts.sendToLlm ?? true));

  if (opts.llmProvider) formData.append("llm_provider", opts.llmProvider);
  if (opts.modelName) formData.append("model_name", opts.modelName);
  if (opts.metadata)
    formData.append("metadata", JSON.stringify(opts.metadata));

  if (opts.files) {
    for (const file of opts.files) {
      formData.append("files", file);
    }
  }

  const res = await fetch(
    `${BACKBOARD_BASE_URL}/threads/${opts.threadId}/messages`,
    {
      method: "POST",
      headers: headers(), // no Content-Type – let FormData set it
      body: formData,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send message: ${res.status} ${errText}`);
  }
  return res.json();
}

// ─── Documents ───

export async function uploadDocumentToThread(
  threadId: string,
  file: File | Blob,
  filename: string
): Promise<BackboardDocument> {
  const formData = new FormData();
  formData.append("files", file, filename);

  const res = await fetch(
    `${BACKBOARD_BASE_URL}/threads/${threadId}/documents`,
    {
      method: "POST",
      headers: headers(),
      body: formData,
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload document: ${res.status} ${errText}`);
  }
  return res.json();
}

export async function uploadDocumentToAssistant(
  file: File | Blob,
  filename: string
): Promise<BackboardDocument> {
  const formData = new FormData();
  formData.append("files", file, filename);

  const res = await fetch(
    `${BACKBOARD_BASE_URL}/assistants/${BACKBOARD_ASSISTANT_ID}/documents`,
    {
      method: "POST",
      headers: headers(),
      body: formData,
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Failed to upload document to assistant: ${res.status} ${errText}`
    );
  }
  return res.json();
}

export async function getDocumentStatus(
  documentId: string
): Promise<BackboardDocument> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/documents/${documentId}/status`,
    { headers: headers() }
  );
  if (!res.ok)
    throw new Error(`Failed to get document status: ${res.statusText}`);
  return res.json();
}

export async function deleteDocument(documentId: string): Promise<void> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/documents/${documentId}`,
    { method: "DELETE", headers: headers() }
  );
  if (!res.ok) throw new Error(`Failed to delete document: ${res.statusText}`);
}

export async function listThreadDocuments(
  threadId: string
): Promise<BackboardDocument[]> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/threads/${threadId}/documents`,
    { headers: headers() }
  );
  if (!res.ok)
    throw new Error(`Failed to list thread documents: ${res.statusText}`);
  return res.json();
}

// ─── Memories ───

export async function listMemories(): Promise<BackboardMemory[]> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/assistants/${BACKBOARD_ASSISTANT_ID}/memories`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Failed to list memories: ${res.statusText}`);
  return res.json();
}

export async function addMemory(
  content: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string; content: string }> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/assistants/${BACKBOARD_ASSISTANT_ID}/memories`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ content, metadata }),
    }
  );
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to add memory: ${res.status} ${errorText}`);
  }
  return res.json();
}

export async function deleteMemory(memoryId: string): Promise<void> {
  const res = await fetch(
    `${BACKBOARD_BASE_URL}/assistants/${BACKBOARD_ASSISTANT_ID}/memories/${memoryId}`,
    { method: "DELETE", headers: headers() }
  );
  if (!res.ok) throw new Error(`Failed to delete memory: ${res.statusText}`);
}

// ─── OCR via Backboard ───
// We create a temporary thread, upload the image, ask the assistant to OCR it,
// then extract the structured data from the response.

import type { OcrResult, OcrExtractedData } from "./types";

const OCR_PROMPT_AADHAAR = `You are an OCR system. Extract ALL information from this Aadhaar card image.
Return ONLY a valid JSON object (no markdown, no code fences):
{
  "full_name": "string or null",
  "document_number": "string (12-digit Aadhaar number) or null",
  "date_of_birth": "string in DD/MM/YYYY format or null",
  "gender": "Male or Female or Other or null",
  "father_or_husband_name": "string or null",
  "address": {
    "line1": "string or null", "line2": "string or null",
    "city": "string or null", "district": "string or null",
    "state": "string or null", "pincode": "string (6 digits) or null"
  }
}
If the image is not an Aadhaar card or unreadable, return: {"error": "description"}`;

const OCR_PROMPT_VOTER_ID = `You are an OCR system. Extract ALL information from this Voter ID (EPIC) card image.
Return ONLY a valid JSON object (no markdown, no code fences):
{
  "full_name": "string or null",
  "document_number": "string (EPIC number) or null",
  "date_of_birth": "string in DD/MM/YYYY format or null",
  "gender": "Male or Female or Other or null",
  "father_or_husband_name": "string or null",
  "address": {
    "line1": "string or null", "line2": "string or null",
    "city": "string or null", "district": "string or null",
    "state": "string or null", "pincode": "string (6 digits) or null"
  }
}
If the image is not a Voter ID or unreadable, return: {"error": "description"}`;

const OCR_PROMPT_GENERIC = `You are an OCR system. Extract ALL information from this Indian government ID card image.
Return ONLY a valid JSON object (no markdown, no code fences):
{
  "full_name": "string or null",
  "document_number": "string (ID number on the card) or null",
  "date_of_birth": "string in DD/MM/YYYY format or null",
  "gender": "Male or Female or Other or null",
  "father_or_husband_name": "string or null",
  "address": {
    "line1": "string or null", "line2": "string or null",
    "city": "string or null", "district": "string or null",
    "state": "string or null", "pincode": "string (6 digits) or null"
  }
}
If the image is unreadable, return: {"error": "description"}`;

function getOcrPrompt(documentType: string): string {
  switch (documentType) {
    case "aadhaar":
      return OCR_PROMPT_AADHAAR;
    case "voter_id":
      return OCR_PROMPT_VOTER_ID;
    default:
      return OCR_PROMPT_GENERIC;
  }
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

/**
 * Extract ID document data using Backboard's document processing + LLM.
 * Creates a temporary thread, uploads the image, sends an OCR prompt,
 * and parses the structured response.
 */
export async function extractDocumentData(
  base64Image: string,
  mimeType: string,
  documentType: string = "generic"
): Promise<OcrResult> {
  let threadId: string | null = null;

  try {
    // 1. Create a temporary thread for OCR
    const thread = await createThread({ purpose: "ocr", documentType });
    threadId = thread.thread_id;

    // 2. Convert base64 to a Blob and upload as attachment
    const imageBuffer = Buffer.from(base64Image, "base64");
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const blob = new Blob([imageBuffer], { type: mimeType });

    // 3. Send message with image attachment + OCR prompt
    const prompt = getOcrPrompt(documentType);

    const formData = new FormData();
    formData.append("content", prompt);
    formData.append("files", blob, `id_document.${ext}`);
    formData.append("stream", "false");
    formData.append("memory", "off");
    formData.append("send_to_llm", "true");

    const res = await fetch(
      `${BACKBOARD_BASE_URL}/threads/${threadId}/messages`,
      {
        method: "POST",
        headers: headers(),
        body: formData,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Backboard OCR request failed: ${res.status} ${errText}`);
    }

    const message: BackboardMessage = await res.json();
    const responseText = message.content || "";
    const jsonText = cleanJsonResponse(responseText);

    // 4. Parse JSON response
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return {
          success: false,
          error:
            "Failed to parse OCR response. The AI returned invalid JSON. Please try again with a clearer image.",
        };
      }
    }

    if ("error" in parsed) {
      return { success: false, error: parsed.error as string };
    }

    const data: OcrExtractedData = {
      full_name: (parsed.full_name as string) || null,
      document_number: (parsed.document_number as string) || null,
      date_of_birth: (parsed.date_of_birth as string) || null,
      gender: (parsed.gender as string) || null,
      father_or_husband_name:
        (parsed.father_or_husband_name as string) || null,
      address: parsed.address
        ? {
            line1:
              ((parsed.address as Record<string, string>).line1 as string) ||
              null,
            line2:
              ((parsed.address as Record<string, string>).line2 as string) ||
              null,
            city:
              ((parsed.address as Record<string, string>).city as string) ||
              null,
            district:
              ((parsed.address as Record<string, string>).district as string) ||
              null,
            state:
              ((parsed.address as Record<string, string>).state as string) ||
              null,
            pincode:
              ((parsed.address as Record<string, string>).pincode as string) ||
              null,
          }
        : null,
    };

    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown OCR error";

    if (message.includes("429") || message.includes("rate")) {
      return {
        success: false,
        error: "Rate limit reached. Please wait a moment and try again.",
      };
    }

    return {
      success: false,
      error: `OCR processing failed: ${message}`,
    };
  } finally {
    // Clean up temporary OCR thread
    if (threadId) {
      deleteThread(threadId).catch(() => {
        // Silently ignore cleanup errors
      });
    }
  }
}
