// ─── Organization Types ───

export interface Organization {
  id: string;
  owner_id: string; // auth user id
  name: string;
  description: string | null;
  work_email: string;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  address: string | null;
  state: string | null;
  district: string | null;
  verified: boolean; // admin-approved
  settings: OrgSettings;
  created_at: string;
  updated_at: string;
}

export interface OrgSettings {
  notification_email?: boolean;
  notification_inapp?: boolean;
  primary_color?: string;
  auto_approve?: boolean;
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
