import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET — fetch single application with full details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: application, error } = await supabase
      .from("scheme_applications")
      .select("*, schemes(*, created_by), user_profiles(id, full_name, email, phone, state, avatar_url, date_of_birth, gender, caste_category, occupation, annual_income, onboarding_completed, id_verified, face_verified)")
      .eq("id", id)
      .single();

    if (error || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Verify org ownership
    const scheme = application.schemes as { created_by: string } | null;
    if (!scheme || scheme.created_by !== user.id) {
      // Also check if admin
      const { data: adminCheck } = await supabase.rpc("is_admin", { user_id: user.id });
      if (!adminCheck) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Org application detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update application status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { status, review_notes } = body;

    if (!status || !["approved", "rejected", "under_review", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify the application exists and org owns the scheme
    const { data: application } = await supabase
      .from("scheme_applications")
      .select("*, schemes(created_by)")
      .eq("id", id)
      .single();

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const scheme = application.schemes as { created_by: string } | null;
    if (!scheme || scheme.created_by !== user.id) {
      const { data: adminCheck } = await supabase.rpc("is_admin", { user_id: user.id });
      if (!adminCheck) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from("scheme_applications")
      .update({
        status,
        review_notes: review_notes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, application: data });
  } catch (error) {
    console.error("Org application update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
