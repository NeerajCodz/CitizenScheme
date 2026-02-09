import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — list scheme requests for an org
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

    const { data: requests, error } = await supabase
      .from("org_scheme_requests")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    console.error("Org schemes GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — submit a new scheme request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: org } = await supabase
      .from("organizations")
      .select("id, verified")
      .eq("owner_id", user.id)
      .single();

    if (!org) return NextResponse.json({ error: "No organization found" }, { status: 404 });

    const body = await request.json();

    const { data, error } = await supabase
      .from("org_scheme_requests")
      .insert({
        org_id: org.id,
        scheme_data: {
          scheme_name: body.scheme_name,
          scheme_code: body.scheme_code || "",
          description: body.description || "",
          benefits: body.benefits || "",
          department: body.department || "",
          state: body.state || null,
          category: body.category || "General",
          eligibility_rules: body.eligibility_rules || {},
          application_process: body.application_process || null,
          official_website: body.official_website || null,
        },
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, request: data });
  } catch (error) {
    console.error("Org scheme request POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
