import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "@/lib/backboard";
import { buildProfileContext } from "@/lib/chatContext";
import type { UserProfile } from "@/lib/types";

function makeTitle(content: string) {
  const clean = content.replace(/\s+/g, " ").trim();
  if (!clean) return "New chat";
  return clean.length > 48 ? `${clean.slice(0, 48)}...` : clean;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: thread } = await supabase
      .from("chat_threads")
      .select("id")
      .eq("id", threadId)
      .eq("user_id", user.id)
      .single();

    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error("Chat messages GET error:", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const { data: thread } = await supabase
      .from("chat_threads")
      .select("id, title, backboard_thread_id")
      .eq("id", threadId)
      .eq("user_id", user.id)
      .single();

    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    const { data: userMessage, error: userInsertError } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        role: "user",
        content,
      })
      .select("id, role, content, created_at")
      .single();

    if (userInsertError || !userMessage) {
      return NextResponse.json({ error: userInsertError?.message || "Failed to save" }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    let enrichedContent = content;
    if (
      profile &&
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
      threadId: thread.backboard_thread_id,
      content: enrichedContent,
      memory: "Auto",
      stream: false,
      webSearch: "off",
    });

    const assistantContent = response.content || "";

    const { data: assistantMessage, error: assistantInsertError } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: threadId,
        role: "assistant",
        content: assistantContent,
      })
      .select("id, role, content, created_at")
      .single();

    if (assistantInsertError || !assistantMessage) {
      return NextResponse.json({ error: assistantInsertError?.message || "Failed to save" }, { status: 500 });
    }

    const isNewTitle = !thread.title || thread.title === "New chat";
    const nextTitle = isNewTitle ? makeTitle(content) : thread.title;

    const { data: updatedThread } = await supabase
      .from("chat_threads")
      .update({
        title: nextTitle,
        last_message: assistantContent || content,
        last_message_at: now,
      })
      .eq("id", threadId)
      .eq("user_id", user.id)
      .select("id, title, last_message, last_message_at, created_at")
      .single();

    return NextResponse.json({
      userMessage,
      assistantMessage,
      thread: updatedThread,
    });
  } catch (error) {
    console.error("Chat messages POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
