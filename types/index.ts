// ─── Barrel Export ───
// All types re-exported from a single entry point.

export type { Address, UserProfile, AdminUser } from "./user";
export type { Scheme, SchemeRecommendation, SchemeApplication, EligibilityRules } from "./scheme";
export type { Organization, OrgSchemeRequest } from "./organization";
export type { OcrResult, OcrExtractedData } from "./ocr";
export type { Notification, NotificationTarget } from "./notification";
