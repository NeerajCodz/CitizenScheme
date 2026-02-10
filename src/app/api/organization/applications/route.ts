import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — list applications for org's schemes
export async function GET(request: NextRequest) {
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

    // Get all schemes created by this org owner
    const { data: schemes } = await supabase
      .from("schemes")
      .select("id, scheme_name, slug")
      .eq("created_by", user.id);

    if (!schemes || schemes.length === 0) {
      return NextResponse.json({ applications: [], stats: { total: 0, pending: 0, approved: 0, rejected: 0, under_review: 0 } });
    }

    const schemeIds = schemes.map((s) => s.id);

    // Parse query params for filters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const schemeId = searchParams.get("scheme_id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = supabase
      .from("scheme_applications")
      .select("*, schemes(id, scheme_name, slug, scheme_type), user_profiles(id, full_name, email, phone, state, avatar_url)", { count: "exact" })
      .in("scheme_id", schemeIds)
      .order("applied_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (schemeId) {
      query = query.eq("scheme_id", schemeId);
    }

    const { data: applications, error, count } = await query;

    if (error) throw error;

    // Get stats
    const { data: allApps } = await supabase
      .from("scheme_applications")
      .select("status")
      .in("scheme_id", schemeIds);

    const stats = {
      total: allApps?.length || 0,
      pending: allApps?.filter((a) => a.status === "pending").length || 0,
      approved: allApps?.filter((a) => a.status === "approved").length || 0,
      rejected: allApps?.filter((a) => a.status === "rejected").length || 0,
      under_review: allApps?.filter((a) => a.status === "under_review").length || 0,
    };

    return NextResponse.json({
      applications: applications || [],
      stats,
      total: count || 0,
      page,
      limit,
      schemes,
    });
  } catch (error) {
    console.error("Org applications GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
