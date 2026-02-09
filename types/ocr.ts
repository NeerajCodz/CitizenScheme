// ─── OCR Types ───

import type { Address } from "./user";

export interface OcrResult {
  success: boolean;
  data?: OcrExtractedData;
  error?: string;
}

export interface OcrExtractedData {
  full_name: string | null;
  document_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  father_or_husband_name: string | null;
  address: Address | null;
}
