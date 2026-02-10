import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — fetch org analytics
export async function GET() {
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

    // Get all org schemes
    const { data: schemes } = await supabase
      .from("schemes")
      .select("id, scheme_name, slug, is_active, created_at, scheme_type")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (!schemes || schemes.length === 0) {
      return NextResponse.json({
        totalSchemes: 0,
        activeSchemes: 0,
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        recentApplications: [],
        schemeStats: [],
      });
    }

    const schemeIds = schemes.map((s) => s.id);

    // Get all applications for org schemes
    const { data: applications } = await supabase
      .from("scheme_applications")
      .select("id, scheme_id, status, applied_at, user_profiles(full_name, email)")
      .in("scheme_id", schemeIds)
      .order("applied_at", { ascending: false });

    const apps = applications || [];

    // Per-scheme stats
    const schemeStats = schemes.map((scheme) => {
      const schemeApps = apps.filter((a) => a.scheme_id === scheme.id);
      return {
        ...scheme,
        total: schemeApps.length,
        pending: schemeApps.filter((a) => a.status === "pending").length,
        approved: schemeApps.filter((a) => a.status === "approved").length,
        rejected: schemeApps.filter((a) => a.status === "rejected").length,
      };
    });

    return NextResponse.json({
      totalSchemes: schemes.length,
      activeSchemes: schemes.filter((s) => s.is_active).length,
      totalApplications: apps.length,
      pendingApplications: apps.filter((a) => a.status === "pending").length,
      approvedApplications: apps.filter((a) => a.status === "approved").length,
      rejectedApplications: apps.filter((a) => a.status === "rejected").length,
      recentApplications: apps.slice(0, 5),
      schemeStats,
    });
  } catch (error) {
    console.error("Org analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
