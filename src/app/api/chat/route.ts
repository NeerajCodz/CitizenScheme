import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createThread,
  getThread,
  sendMessage,
  addMemory,
} from "@/lib/backboard";
import type { UserProfile } from "@/lib/types";

// ─── GET: Get or create a chat thread for the current user ───
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a thread_id stored
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    let threadId = profile.chatbot_thread_id;

    // If user has a thread, fetch it with messages
    if (threadId) {
      try {
        const thread = await getThread(threadId);
        return NextResponse.json({
          thread_id: thread.thread_id,
          messages: thread.messages || [],
        });
      } catch {
        // Thread may have been deleted; create a new one
        threadId = null;
      }
    }

    // Create a new thread and seed it with user context
    const thread = await createThread({
      user_id: user.id,
      purpose: "citizen_chatbot",
    });

    // Store the thread_id in the user profile
    await supabase
      .from("user_profiles")
      .update({ chatbot_thread_id: thread.thread_id })
      .eq("id", user.id);

    // Seed the assistant with user profile context via memory
    const profileContext = buildProfileContext(profile as UserProfile);
    if (profileContext) {
      await addMemory(profileContext);
    }

    return NextResponse.json({
      thread_id: thread.thread_id,
      messages: [],
    });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { error: "Failed to initialize chat" },
      { status: 500 }
    );
  }
}

// ─── POST: Send a message to the chatbot ───
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let content: string = "";
    let threadId: string = "";
    let files: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      content = (formData.get("content") as string) || "";
      threadId = (formData.get("thread_id") as string) || "";

      // Collect all uploaded files
      const formFiles = formData.getAll("files");
      files = formFiles.filter((f) => f instanceof File) as File[];
    } else {
      const body = await request.json();
      content = body.content || "";
      threadId = body.thread_id || "";
    }

    if (!threadId) {
      return NextResponse.json(
        { error: "thread_id is required" },
        { status: 400 }
      );
    }

    if (!content && files.length === 0) {
      return NextResponse.json(
        { error: "Message content or files required" },
        { status: 400 }
      );
    }

    // Fetch user profile for context enrichment
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Build enriched message with profile context if asking about schemes
    let enrichedContent = content;
    if (
      profile &&
      content &&
      (content.toLowerCase().includes("scheme") ||
        content.toLowerCase().includes("eligible") ||
        content.toLowerCase().includes("benefit") ||
        content.toLowerCase().includes("recommend") ||
        content.toLowerCase().includes("apply"))
    ) {
      const ctx = buildProfileContext(profile as UserProfile);
      enrichedContent = `[User Profile Context: ${ctx}]\n\nUser Question: ${content}`;
    }

    const response = await sendMessage({
      threadId,
      content: enrichedContent,
      files: files.length > 0 ? files : undefined,
      memory: "Auto",
      stream: false,
      webSearch: "off",
    });

    return NextResponse.json({
      message_id: response.message_id,
      content: response.content,
      role: response.role,
      attachments: response.attachments || [],
      retrieved_memories: response.retrieved_memories || [],
      retrieved_files: response.retrieved_files || [],
      created_at: response.created_at,
    });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Reset conversation (delete thread, create new one) ───
export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("chatbot_thread_id")
      .eq("id", user.id)
      .single();

    // Delete old thread if exists (fire and forget)
    if (profile?.chatbot_thread_id) {
      const { deleteThread } = await import("@/lib/backboard");
      deleteThread(profile.chatbot_thread_id).catch(() => {});
    }

    // Create fresh thread
    const thread = await createThread({
      user_id: user.id,
      purpose: "citizen_chatbot",
    });

    await supabase
      .from("user_profiles")
      .update({ chatbot_thread_id: thread.thread_id })
      .eq("id", user.id);

    return NextResponse.json({
      thread_id: thread.thread_id,
      messages: [],
    });
  } catch (error) {
    console.error("Chat DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to reset chat" },
      { status: 500 }
    );
  }
}

// ─── Helpers ───

function buildProfileContext(profile: UserProfile): string {
  const parts: string[] = [];

  if (profile.full_name) parts.push(`Name: ${profile.full_name}`);
  if (profile.gender) parts.push(`Gender: ${profile.gender}`);
  if (profile.date_of_birth) parts.push(`DOB: ${profile.date_of_birth}`);
  if (profile.state) parts.push(`State: ${profile.state}`);
  if (profile.annual_income !== null && profile.annual_income !== undefined)
    parts.push(`Annual Income: ₹${profile.annual_income.toLocaleString()}`);
  if (profile.caste_category) parts.push(`Category: ${profile.caste_category}`);
  if (profile.occupation) parts.push(`Occupation: ${profile.occupation}`);
  if (profile.disability_status)
    parts.push(`Disability: ${profile.disability_status}`);
  if (profile.address) {
    const addr = profile.address;
    const addrParts = [addr.city, addr.district, addr.state, addr.pincode]
      .filter(Boolean)
      .join(", ");
    if (addrParts) parts.push(`Address: ${addrParts}`);
  }

  return parts.join("; ");
}
