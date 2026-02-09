import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSchemeRecommendations } from "@/lib/recommendation";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Fetch user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Build scheme query
    let query = supabase
      .from("schemes")
      .select("*")
      .eq("is_active", true);

    if (state) {
      query = query.or(`state.eq.${state},state.is.null`);
    }
    if (category) {
      query = query.eq("category", category);
    }
    if (search) {
      query = query.or(
        `scheme_name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data: schemes, error } = await query.order("scheme_name");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch schemes" },
        { status: 500 }
      );
    }

    // Calculate recommendations
    const recommendations = getSchemeRecommendations(profile, schemes || []);

    return NextResponse.json({
      recommendations,
      profile,
      total: recommendations.length,
    });
  } catch (error) {
    console.error("Schemes recommend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
