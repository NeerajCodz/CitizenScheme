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

    const body = await request.json();
    const updateData = {
      full_name: body.full_name ?? null,
      date_of_birth: body.date_of_birth ?? null,
      gender: body.gender ? body.gender.toLowerCase() : null,
      state: body.state ?? null,
      address_line: body.address_line ?? null,
      district: body.district ?? null,
      pincode: body.pincode ?? null,
      annual_income: body.annual_income ?? null,
      caste_category: body.caste_category ? body.caste_category.toLowerCase() : null,
      disability_status: body.disability_status ?? null,
      occupation: body.occupation ?? null,
      phone: body.phone ?? null,
      interested_tags: body.interested_tags ?? [],
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      console.error("Database error saving profile:", error);
      return NextResponse.json(
        { error: "Failed to save profile", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
