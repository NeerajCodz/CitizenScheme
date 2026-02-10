import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET — fetch single scheme details for org
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: scheme, error } = await supabase
      .from("schemes")
      .select("*")
      .eq("id", id)
      .eq("created_by", user.id)
      .single();

    if (error || !scheme) {
      return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    }

    // Get application stats for this scheme
    const { data: apps } = await supabase
      .from("scheme_applications")
      .select("status")
      .eq("scheme_id", id);

    const stats = {
      total: apps?.length || 0,
      pending: apps?.filter((a) => a.status === "pending").length || 0,
      approved: apps?.filter((a) => a.status === "approved").length || 0,
      rejected: apps?.filter((a) => a.status === "rejected").length || 0,
      under_review: apps?.filter((a) => a.status === "under_review").length || 0,
    };

    return NextResponse.json({ scheme, stats });
  } catch (error) {
    console.error("Org scheme detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update scheme
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const { data: existing } = await supabase
      .from("schemes")
      .select("id, created_by")
      .eq("id", id)
      .eq("created_by", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Scheme not found or not owned by you" }, { status: 404 });
    }

    const body = await request.json();
    const allowedFields = [
      "scheme_name", "description", "benefits", "department", "state",
      "category", "eligibility_rules", "application_process", "official_website",
      "is_active", "application_form_fields",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const { data, error } = await supabase
      .from("schemes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, scheme: data });
  } catch (error) {
    console.error("Org scheme update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
