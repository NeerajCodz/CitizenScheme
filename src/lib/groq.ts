// ─── Groq Vision API for OCR ───
import type { OcrResult, OcrExtractedData } from "./types";

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const AADHAAR_PROMPT = `You are an advanced OCR system specialized in extracting data from Indian Aadhaar cards.

Analyze the provided image carefully and extract ALL visible information.

Return ONLY a valid JSON object in this EXACT format (no markdown, no code fences, no explanation):

{
  "full_name": "string or null",
  "document_number": "string (12-digit Aadhaar number, with or without spaces) or null",
  "date_of_birth": "string in DD/MM/YYYY format or null",
  "gender": "Male or Female or Other or null",
  "father_or_husband_name": "string or null",
  "address": {
    "line1": "string or null",
    "line2": "string or null",
    "city": "string or null",
    "district": "string or null",
    "state": "string or null",
    "pincode": "string (6 digits) or null"
  }
}

CRITICAL RULES:
1. Return ONLY the JSON object. No markdown, no code blocks, no extra text.
2. If a field is not visible or unreadable, set it to null.
3. Preserve exact spelling as shown on the card.
4. The Aadhaar number should be the full 12-digit number.
5. Dates must follow DD/MM/YYYY format.
6. If the image is blurry, unreadable, or not an Aadhaar card, return:
   {"error": "Description of the problem"}
7. For masked Aadhaar (XXXX XXXX 1234), return only the visible digits.`;

const VOTER_ID_PROMPT = `You are an advanced OCR system specialized in extracting data from Indian Voter ID cards (EPIC).

Analyze the provided image carefully and extract ALL visible information.

Return ONLY a valid JSON object in this EXACT format (no markdown, no code fences, no explanation):

{
  "full_name": "string or null",
  "document_number": "string (EPIC number) or null",
  "date_of_birth": "string in DD/MM/YYYY format or null",
  "gender": "Male or Female or Other or null",
  "father_or_husband_name": "string or null",
  "address": {
    "line1": "string or null",
    "line2": "string or null",
    "city": "string or null",
    "district": "string or null",
    "state": "string or null",
    "pincode": "string (6 digits) or null"
  }
}

CRITICAL RULES:
1. Return ONLY the JSON object. No markdown, no code blocks, no extra text.
2. If a field is not visible or unreadable, set it to null.
3. Preserve exact spelling as shown on the card.
4. Dates must follow DD/MM/YYYY format.
5. If the image is blurry, unreadable, or not a Voter ID card, return:
   {"error": "Description of the problem"}`;

const GENERIC_ID_PROMPT = `You are an advanced OCR system specialized in extracting data from Indian government ID cards (Aadhaar, Voter ID, PAN, Driving License, etc.).

Analyze the provided image carefully and extract ALL visible personal information.

Return ONLY a valid JSON object in this EXACT format (no markdown, no code fences, no explanation):

{
  "full_name": "string or null",
  "document_number": "string (ID number visible on the card) or null",
  "date_of_birth": "string in DD/MM/YYYY format or null",
  "gender": "Male or Female or Other or null",
  "father_or_husband_name": "string or null",
  "address": {
    "line1": "string or null",
    "line2": "string or null",
    "city": "string or null",
    "district": "string or null",
    "state": "string or null",
    "pincode": "string (6 digits) or null"
  }
}

CRITICAL RULES:
1. Return ONLY the JSON object. No markdown, no code blocks, no extra text.
2. If a field is not visible or unreadable, set it to null.
3. Preserve exact spelling as shown on the card.
4. If the image is blurry, unreadable, or not a valid ID card, return:
   {"error": "Description of the problem"}`;

function getPrompt(documentType: string): string {
  switch (documentType) {
    case "aadhaar":
      return AADHAAR_PROMPT;
    case "voter_id":
      return VOTER_ID_PROMPT;
    default:
      return GENERIC_ID_PROMPT;
  }
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

export async function extractDocumentData(
  base64Image: string,
  mimeType: string,
  documentType: string = "generic"
): Promise<OcrResult> {
  try {
    const prompt = getPrompt(documentType);

    // Groq vision API call (using meta-llama/llama-4-scout-17b-16e-instruct)
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const jsonText = cleanJsonResponse(text);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return {
          success: false,
          error:
            "Failed to parse OCR response. The AI returned invalid JSON. Please try again with a clearer image.",
        };
      }
    }

    // Check if the response contains an error
    if ("error" in parsed) {
      return {
        success: false,
        error: parsed.error as string,
      };
    }

    const extractedData: OcrExtractedData = {
      full_name: (parsed.full_name as string) || null,
      document_number: (parsed.document_number as string) || null,
      date_of_birth: (parsed.date_of_birth as string) || null,
      gender: (parsed.gender as string) || null,
      father_or_husband_name:
        (parsed.father_or_husband_name as string) || null,
      address: parsed.address
        ? {
            line1:
              ((parsed.address as Record<string, string>).line1 as string) ||
              null,
            line2:
              ((parsed.address as Record<string, string>).line2 as string) ||
              null,
            city:
              ((parsed.address as Record<string, string>).city as string) ||
              null,
            district:
              ((parsed.address as Record<string, string>).district as string) ||
              null,
            state:
              ((parsed.address as Record<string, string>).state as string) ||
              null,
            pincode:
              ((parsed.address as Record<string, string>).pincode as string) ||
              null,
          }
        : null,
    };

    return { success: true, data: extractedData };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown OCR error";

    if (message.includes("429") || message.includes("rate")) {
      return {
        success: false,
        error: "Rate limit reached. Please wait a moment and try again.",
      };
    }

    return {
      success: false,
      error: `OCR processing failed: ${message}`,
    };
  }
}
