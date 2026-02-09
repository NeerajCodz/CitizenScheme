import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  uploadDocumentToThread,
  getDocumentStatus,
  listThreadDocuments,
} from "@/lib/backboard";

// ─── POST: Upload a document to the user's chat thread ───
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const threadId = formData.get("thread_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!threadId) {
      return NextResponse.json(
        { error: "thread_id is required" },
        { status: 400 }
      );
    }

    // Upload to Backboard
    const doc = await uploadDocumentToThread(threadId, file, file.name);

    return NextResponse.json({
      document_id: doc.document_id,
      filename: doc.filename,
      status: doc.status,
    });
  } catch (error) {
    console.error("Chat document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// ─── GET: List documents or check document status ───
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("document_id");
    const threadId = searchParams.get("thread_id");

    // Check specific document status
    if (documentId) {
      const status = await getDocumentStatus(documentId);
      return NextResponse.json(status);
    }

    // List all thread documents
    if (threadId) {
      const docs = await listThreadDocuments(threadId);
      return NextResponse.json(docs);
    }

    return NextResponse.json(
      { error: "thread_id or document_id required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Chat document GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
