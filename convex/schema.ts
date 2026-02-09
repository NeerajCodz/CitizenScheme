import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notifications: defineTable({
    userId: v.string(), // Supabase auth user id
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("scheme_update"),
      v.literal("application_status"),
      v.literal("new_scheme"),
      v.literal("admin_message"),
      v.literal("org_update")
    ),
    link: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(), // Date.now()
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"])
    .index("by_user_created", ["userId", "createdAt"]),
});
