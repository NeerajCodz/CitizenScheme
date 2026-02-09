import type { UserProfile } from "@/lib/types";
import { addMemory, listMemories } from "@/lib/backboard";
import type { BackboardMemory } from "@/lib/backboard";
import type { createClient } from "@/lib/supabase/server";

export function buildProfileContext(profile: UserProfile): string {
  const parts: string[] = [];

  if (profile.full_name) parts.push(`Name: ${profile.full_name}`);
  if (profile.gender) parts.push(`Gender: ${profile.gender}`);
  if (profile.date_of_birth) parts.push(`DOB: ${profile.date_of_birth}`);
  if (profile.state) parts.push(`State: ${profile.state}`);
  if (profile.annual_income !== null && profile.annual_income !== undefined) {
    parts.push(`Annual Income: ${profile.annual_income.toLocaleString()}`);
  }
  if (profile.caste_category) parts.push(`Category: ${profile.caste_category}`);
  if (profile.occupation) parts.push(`Occupation: ${profile.occupation}`);
  if (profile.disability_status) parts.push(`Disability: ${profile.disability_status}`);
  if (profile.address) {
    const addr = profile.address;
    const addrParts = [addr.city, addr.district, addr.state, addr.pincode]
      .filter(Boolean)
      .join(", ");
    if (addrParts) parts.push(`Address: ${addrParts}`);
  }

  return parts.join("; ");
}

export async function syncBackboardMemories(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  profileContext: string | null
) {
  const memoriesResponse = await listMemories();
  const memories = Array.isArray(memoriesResponse)
    ? memoriesResponse
    : (memoriesResponse as { memories?: BackboardMemory[] }).memories || [];
  const memoryText = memories.map((m) => m.memory || "");

  const hasProfileMemory = memoryText.some((m) =>
    m.includes("[type:profile]") && m.includes(`user_id:${userId}`)
  );

  if (profileContext && !hasProfileMemory) {
    await addMemory(
      `[type:profile]\nuser_id:${userId}\n${profileContext}`,
      { type: "profile", user_id: userId }
    );
  }

  const { data: schemes } = await supabase
    .from("schemes")
    .select(
      "id, scheme_name, description, benefits, category, state, department, application_process, official_website"
    )
    .eq("is_active", true);

  if (!schemes) return;

  for (const scheme of schemes) {
    const marker = `scheme_id:${scheme.id}`;
    const exists = memoryText.some(
      (m) => m.includes("[type:scheme]") && m.includes(marker)
    );

    if (exists) continue;

    const content = [
      "[type:scheme]",
      `scheme_id:${scheme.id}`,
      `scheme_name:${scheme.scheme_name || ""}`,
      `category:${scheme.category || ""}`,
      `state:${scheme.state || "National"}`,
      `department:${scheme.department || ""}`,
      `benefits:${scheme.benefits || ""}`,
      `description:${scheme.description || ""}`,
      `application_process:${scheme.application_process || ""}`,
      `official_website:${scheme.official_website || ""}`,
    ].join("\n");

    await addMemory(content, {
      type: "scheme",
      scheme_id: scheme.id,
    });
  }
}
