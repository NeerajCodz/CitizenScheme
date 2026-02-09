import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getOrgByOwner(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", userId)
    .single();
  return data;
}

// GET — fetch the user's organization
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const org = await getOrgByOwner(supabase, user.id);
    return NextResponse.json({ organization: org });
  } catch (error) {
    console.error("Org GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create organization (onboarding)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if already has org
    const existing = await getOrgByOwner(supabase, user.id);
    if (existing) {
      return NextResponse.json({ error: "You already have an organization" }, { status: 409 });
    }

    const body = await request.json();
    const { data, error } = await supabase
      .from("organizations")
      .insert({
        owner_id: user.id,
        name: body.name,
        description: body.description || null,
        work_email: body.work_email,
        website: body.website || null,
        address: body.address || null,
        state: body.state || null,
        district: body.district || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Org insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, organization: data });
  } catch (error) {
    console.error("Org POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
