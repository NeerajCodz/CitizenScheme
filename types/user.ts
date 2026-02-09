// ─── User & Address Types ───

export interface Address {
  line1: string | null;
  line2: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;

  // OCR extracted
  aadhaar_number: string | null;
  voter_id: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: Address | null;

  // Verification
  id_verified: boolean;
  face_verified: boolean;
  onboarding_completed: boolean;

  // Additional profile
  annual_income: number | null;
  caste_category: string | null;
  disability_status: string | null;
  occupation: string | null;
  state: string | null;

  // Storage paths
  id_document_url: string | null;
  face_front_url: string | null;
  face_left_url: string | null;
  face_right_url: string | null;

  // Interests / tags
  interested_tags: string[];

  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  role: "admin" | "super_admin";
  created_at: string;
}
