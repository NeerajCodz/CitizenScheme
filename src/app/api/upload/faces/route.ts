import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FACES_BUCKET = process.env.FACES_BUCKET || "face-verification";

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
    const { front, left, right } = body;

    if (!front || !left || !right) {
      return NextResponse.json(
        { error: "All three face images (front, left, right) are required" },
        { status: 400 }
      );
    }

    const uploads: Record<string, string | null> = {
      face_front_url: null,
      face_left_url: null,
      face_right_url: null,
    };

    const images = [
      { key: "face_front_url", data: front, name: "front" },
      { key: "face_left_url", data: left, name: "left" },
      { key: "face_right_url", data: right, name: "right" },
    ];

    for (const img of images) {
      const base64Data = img.data.includes(",")
        ? img.data.split(",")[1]
        : img.data;
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `${user.id}/face_${img.name}_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(FACES_BUCKET)
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from(FACES_BUCKET).getPublicUrl(fileName);
        uploads[img.key] = publicUrl;
      }
    }

    // Update user profile — set front face as avatar_url (profile picture)
    await supabase
      .from("user_profiles")
      .update({
        face_front_url: uploads.face_front_url,
        face_left_url: uploads.face_left_url,
        face_right_url: uploads.face_right_url,
        avatar_url: uploads.face_front_url, // Use front face as profile avatar
        face_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      urls: uploads,
    });
  } catch (error) {
    console.error("Face upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload face images" },
      { status: 500 }
    );
  }
}
