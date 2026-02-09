// ─── Organization Types ───

export interface Organization {
  id: string;
  owner_id: string; // auth user id
  name: string;
  description: string | null;
  work_email: string;
  logo_url: string | null;
  website: string | null;
  address: string | null;
  state: string | null;
  district: string | null;
  verified: boolean; // admin-approved
  created_at: string;
  updated_at: string;
}

export interface OrgSchemeRequest {
  id: string;
  org_id: string;
  scheme_data: {
    scheme_name: string;
    scheme_code: string;
    description: string;
    benefits: string;
    department: string;
    state: string | null;
    category: string;
    eligibility_rules: Record<string, unknown>;
    application_process: string | null;
    official_website: string | null;
  };
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}
