import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: schemes, error } = await supabase
      .from("schemes")
      .select("*")
      .eq("is_active", true)
      .order("scheme_name");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch schemes" },
        { status: 500 }
      );
    }

    return NextResponse.json({ schemes: schemes || [] });
  } catch (error) {
    console.error("Schemes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
