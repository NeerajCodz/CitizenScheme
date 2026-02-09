import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractDocumentData } from "@/lib/groq";

const DOCUMENTS_BUCKET = process.env.DOCUMENTS_BUCKET || "documents";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let base64Data: string;
    let mimeType: string = "image/jpeg";
    let documentType: string = "generic";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData upload from onboarding
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const type = formData.get("type") as string | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      mimeType = file.type || "image/jpeg";
      documentType = type || "generic";

      const arrayBuffer = await file.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString("base64");
    } else {
      // Handle JSON with base64 image
      const body = await request.json();
      const { image, mimeType: bodyMime, documentType: bodyDocType } = body;

      if (!image) {
        return NextResponse.json({ error: "No image data provided" }, { status: 400 });
      }

      base64Data = image.includes(",") ? image.split(",")[1] : image;
      mimeType = bodyMime || "image/jpeg";
      documentType = bodyDocType || "generic";
    }

    // Call Backboard for OCR
    const ocrResult = await extractDocumentData(base64Data, mimeType, documentType);

    if (!ocrResult.success) {
      return NextResponse.json({ error: ocrResult.error, success: false }, { status: 422 });
    }

    // Upload the image to Supabase storage
    const fileName = `${user.id}/id_${Date.now()}.jpg`;
    const imageBuffer = Buffer.from(base64Data, "base64");

    const { error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(fileName, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    let documentUrl: string | null = null;
    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(fileName);
      documentUrl = publicUrl;
    }

    // Update user profile with extracted data
    const extractedData = ocrResult.data!;
    const updateData: Record<string, unknown> = {
      id_verified: true,
      id_document_url: documentUrl,
      updated_at: new Date().toISOString(),
    };

    if (extractedData.full_name) updateData.full_name = extractedData.full_name;
    if (extractedData.date_of_birth) updateData.date_of_birth = extractedData.date_of_birth;
    if (extractedData.gender) updateData.gender = extractedData.gender;
    if (extractedData.address) {
      updateData.address = extractedData.address;
      if (extractedData.address.state) updateData.state = extractedData.address.state;
    }

    if (documentType === "aadhaar") {
      updateData.aadhaar_number = extractedData.document_number;
    } else if (documentType === "voter_id") {
      updateData.voter_id = extractedData.document_number;
    }

    await supabase.from("user_profiles").update(updateData).eq("id", user.id);

    return NextResponse.json({ success: true, data: extractedData, documentUrl });
  } catch (error) {
    console.error("OCR route error:", error);
    return NextResponse.json(
      { error: "Internal server error processing document", success: false },
      { status: 500 }
    );
  }
}
