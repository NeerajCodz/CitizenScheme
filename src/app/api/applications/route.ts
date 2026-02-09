import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an admin - admins cannot apply to schemes
    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (adminCheck) {
      return NextResponse.json(
        { error: "Admins cannot apply to schemes. Only organizations can submit applications." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { scheme_id } = body;

    if (!scheme_id) {
      return NextResponse.json(
        { error: "scheme_id is required" },
        { status: 400 }
      );
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from("scheme_applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("scheme_id", scheme_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this scheme" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("scheme_applications")
      .insert({
        user_id: user.id,
        scheme_id,
        status: "pending",
        eligibility_score: body.eligibility_score || 0,
        eligibility_details: body.eligibility_details || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, application: data });
  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("scheme_applications")
      .select("*, schemes(*)")
      .eq("user_id", user.id)
      .order("applied_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: data || [] });
  } catch (error) {
    console.error("Applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
