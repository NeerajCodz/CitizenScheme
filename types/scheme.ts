// ─── Scheme & Eligibility Types ───

export interface EligibilityRules {
  age?: { min?: number; max?: number };
  income?: { max?: number };
  gender?: string[];
  caste?: string[];
  states?: string[];
  occupation?: string[];
  disability?: boolean;
  required_documents?: string[];
}

export interface Scheme {
  id: string;
  slug: string;
  scheme_name: string;
  scheme_code: string;
  description: string;
  benefits: string;
  department: string;
  state: string | null; // null = national
  eligibility_rules: EligibilityRules;
  application_process: string | null;
  official_website: string | null;
  is_active: boolean;
  category: string;
  icon: string | null;
  created_by: string | null; // user id or org id
  scheme_type: 'government' | 'private'; // government = redirect, private = our form
  application_form_fields: ApplicationFormField[];
  created_at: string;
  updated_at: string;
}

export interface SchemeRecommendation extends Scheme {
  eligibility_score: number;
  matching_criteria: string[];
  missing_criteria: string[];
}

export interface ApplicationFormField {
  id: string;
  type: 'text' | 'textarea' | 'file' | 'select' | 'date' | 'number' | 'checkbox';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select/checkbox
  validation?: {
    min?: number;
    max?: number;
    maxSize?: number; // for file uploads in MB
    accept?: string; // file types
  };
}

export interface SchemeApplication {
  id: string;
  user_id: string;
  scheme_id: string;
  status: "pending" | "approved" | "rejected" | "under_review";
  eligibility_score: number;
  eligibility_details: Record<string, boolean>;
  form_responses: Record<string, string | number | boolean>;
  documents: { url: string; name: string; field_id: string }[];
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  applied_at: string;
  updated_at: string;
  // Joined data
  schemes?: Scheme;
  user_profiles?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    state: string | null;
    avatar_url: string | null;
  };
}
