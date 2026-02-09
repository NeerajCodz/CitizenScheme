import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

// Create Convex client only if URL is configured
let convex: ConvexHttpClient | null = null;
if (process.env.NEXT_PUBLIC_CONVEX_URL) {
  convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
    skipConvexDeploymentUrlCheck: true,
  });
}

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from("admin_users").select("id").eq("id", userId).single();
  return !!data;
}

// POST — send targeted notifications
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, type, link, target } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message required" }, { status: 400 });
    }

    let userIds: string[] = [];

    switch (target?.type) {
      case "individual":
        if (!target.value) return NextResponse.json({ error: "User ID required" }, { status: 400 });
        userIds = [target.value];
        break;

      case "state": {
        const { data: users } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("state", target.value);
        userIds = (users || []).map((u: { id: string }) => u.id);
        break;
      }

      case "caste": {
        const { data: users } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("caste_category", target.value);
        userIds = (users || []).map((u: { id: string }) => u.id);
        break;
      }

      case "category": {
        // Notify users who applied to schemes of this category
        const { data: schemes } = await supabase
          .from("schemes")
          .select("id")
          .eq("category", target.value);
        const schemeIds = (schemes || []).map((s: { id: string }) => s.id);
        if (schemeIds.length > 0) {
          const { data: apps } = await supabase
            .from("scheme_applications")
            .select("user_id")
            .in("scheme_id", schemeIds);
          userIds = [...new Set((apps || []).map((a: { user_id: string }) => a.user_id))];
        }
        break;
      }

      case "occupation": {
        const { data: users } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("occupation", target.value);
        userIds = (users || []).map((u: { id: string }) => u.id);
        break;
      }

      case "all":
      default: {
        const { data: users } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("onboarding_completed", true);
        userIds = (users || []).map((u: { id: string }) => u.id);
        break;
      }
    }

    if (userIds.length === 0) {
      return NextResponse.json({ error: "No users match the target criteria" }, { status: 404 });
    }

    // Check if Convex is configured
    if (!convex) {
      return NextResponse.json(
        { error: "Notification system not configured. Please set NEXT_PUBLIC_CONVEX_URL in .env.local" },
        { status: 503 }
      );
    }

    // Send via Convex
    await convex.mutation(api.notifications.sendBulk, {
      userIds,
      title,
      message,
      type: type || "admin_message",
      link: link || undefined,
    });

    return NextResponse.json({
      success: true,
      sent: userIds.length,
    });
  } catch (error) {
    console.error("Admin notify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
