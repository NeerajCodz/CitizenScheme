import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Queries ───

export const getForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    return unread.length;
  },
});

// ─── Mutations ───

export const send = mutation({
  args: {
    userId: v.string(),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      link: args.link,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const sendBulk = mutation({
  args: {
    userIds: v.array(v.string()),
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
  },
  handler: async (ctx, args) => {
    const promises = args.userIds.map((userId) =>
      ctx.db.insert("notifications", {
        userId,
        title: args.title,
        message: args.message,
        type: args.type,
        link: args.link,
        read: false,
        createdAt: Date.now(),
      })
    );
    await Promise.all(promises);
    return { sent: args.userIds.length };
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    await Promise.all(
      unread.map((n) => ctx.db.patch(n._id, { read: true }))
    );
    return { marked: unread.length };
  },
});

export const remove = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
  },
});
