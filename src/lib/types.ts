// Re-export all types from the root types/ folder for backward compatibility.
// New code should import from "@types/*" directly.
export type {
  Address,
  UserProfile,
  AdminUser,
  Scheme,
  SchemeRecommendation,
  SchemeApplication,
  EligibilityRules,
  Organization,
  OrgSchemeRequest,
  OcrResult,
  OcrExtractedData,
  Notification,
  NotificationTarget,
} from "../../types";
