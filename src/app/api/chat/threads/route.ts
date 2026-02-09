import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createThread } from "@/lib/backboard";
import { buildProfileContext, syncBackboardMemories } from "@/lib/chatContext";
import type { UserProfile } from "@/lib/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: threads, error } = await supabase
      .from("chat_threads")
      .select("id, title, last_message, last_message_at, created_at")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ threads: threads || [] });
  } catch (error) {
    console.error("Chat threads GET error:", error);
    return NextResponse.json({ error: "Failed to load threads" }, { status: 500 });
  }
}

export async function POST() {
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
      .select("*")
      .eq("id", user.id)
      .single();

    const thread = await createThread({
      user_id: user.id,
      purpose: "citizen_chat",
    });

    if (profile) {
      const context = buildProfileContext(profile as UserProfile);
      await syncBackboardMemories(supabase, user.id, context);
    }

    const now = new Date().toISOString();
    const { data: inserted, error } = await supabase
      .from("chat_threads")
      .insert({
        user_id: user.id,
        title: "New chat",
        last_message_at: now,
        backboard_thread_id: thread.thread_id,
      })
      .select("id, title, last_message, last_message_at, created_at")
      .single();

    if (error || !inserted) {
      return NextResponse.json({ error: error?.message || "Failed to create" }, { status: 500 });
    }

    return NextResponse.json({ thread: inserted });
  } catch (error) {
    console.error("Chat threads POST error:", error);
    return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
  }
}
