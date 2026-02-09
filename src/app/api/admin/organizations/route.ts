import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from("admin_users").select("id").eq("id", userId).single();
  return !!data;
}

// GET — list all organizations and scheme requests
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [{ data: organizations }, { data: requests }] = await Promise.all([
      supabase.from("organizations").select("*").order("created_at", { ascending: false }),
      supabase.from("org_scheme_requests").select("*, organizations(name, work_email)").order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      organizations: organizations || [],
      requests: requests || [],
    });
  } catch (error) {
    console.error("Admin orgs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT — verify/unverify an organization
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, verified } = await request.json();
    const { error } = await supabase
      .from("organizations")
      .update({ verified, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin org verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — approve/reject a scheme request
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { requestId, status, admin_notes } = await request.json();

    const { error } = await supabase
      .from("org_scheme_requests")
      .update({
        status,
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) throw error;

    // If approved, create the actual scheme
    if (status === "approved") {
      const { data: req } = await supabase
        .from("org_scheme_requests")
        .select("scheme_data, org_id")
        .eq("id", requestId)
        .single();

      if (req?.scheme_data) {
        const sd = req.scheme_data as Record<string, unknown>;
        const slug = (sd.scheme_name as string || "scheme")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        await supabase.from("schemes").insert({
          slug,
          scheme_name: sd.scheme_name,
          scheme_code: sd.scheme_code || slug.toUpperCase(),
          description: sd.description || "",
          benefits: sd.benefits || "",
          department: sd.department || "",
          state: sd.state || null,
          category: sd.category || "General",
          eligibility_rules: sd.eligibility_rules || {},
          application_process: sd.application_process || null,
          official_website: sd.official_website || null,
          created_by: req.org_id,
          is_active: true,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin org request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
