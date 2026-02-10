import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH — update organization settings/profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!org) return NextResponse.json({ error: "No organization found" }, { status: 404 });

    const body = await request.json();
    const allowedFields = [
      "name", "description", "work_email", "website", "address",
      "state", "district", "logo_url", "banner_url", "settings",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const { data, error } = await supabase
      .from("organizations")
      .update(updateData)
      .eq("id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, organization: data });
  } catch (error) {
    console.error("Org settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
