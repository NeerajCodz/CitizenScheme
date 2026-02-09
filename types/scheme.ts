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
  created_at: string;
  updated_at: string;
}

export interface SchemeRecommendation extends Scheme {
  eligibility_score: number;
  matching_criteria: string[];
  missing_criteria: string[];
}

export interface SchemeApplication {
  id: string;
  user_id: string;
  scheme_id: string;
  status: "pending" | "approved" | "rejected" | "in_review";
  eligibility_score: number;
  eligibility_details: Record<string, boolean>;
  applied_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}
