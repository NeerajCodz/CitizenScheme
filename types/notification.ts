// ─── Notification Types ───

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "scheme_update" | "application_status" | "new_scheme" | "admin_message" | "org_update";
  link?: string;
  read: boolean;
  createdAt: number; // timestamp
}

export interface NotificationTarget {
  type: "all" | "individual" | "state" | "caste" | "category" | "occupation";
  value?: string; // userId, state name, caste name, etc.
}
