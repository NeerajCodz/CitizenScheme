"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, ExternalLink, Trash2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Id } from "../../../convex/_generated/dataModel";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { tDb } from "@/lib/dbI18n";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const notifications = useQuery(
    api.notifications.getForUser,
    userId ? { userId } : "skip"
  );
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    userId ? { userId } : "skip"
  );
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const removeNotif = useMutation(api.notifications.remove);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/40 dark:border-white/10 bg-[#f0f0f3]/80 dark:bg-[hsl(240,10%,10%)]/80 backdrop-blur-xl">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full neo-elevated"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-emerald-600" />
                <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              </div>
            </div>
            {unreadCount && unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => userId && markAllRead({ userId })}
                className="flex items-center gap-2 neo-elevated border-0 rounded-xl"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {!notifications || notifications.length === 0 ? (
          <div className="neo-elevated-lg rounded-2xl border-0">
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="neo-inset rounded-full p-6 mb-6">
                <Bell className="h-16 w-16 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">No notifications yet</h2>
              <p className="text-slate-500 text-center max-w-md">
                When you receive notifications about schemes, applications, or updates,
                they&apos;ll appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {notifications.map((n: { 
                _id: string; 
                read: boolean; 
                title: string; 
                message: string; 
                type: string; 
                link?: string; 
                createdAt: number 
              }, index: number) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={`neo-elevated rounded-2xl cursor-pointer transition-all hover:translate-y-[-2px] ${
                      !n.read
                        ? "ring-2 ring-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-900/10"
                        : ""
                    }`}
                    onClick={() => {
                      if (!n.read) markRead({ notificationId: n._id as Id<"notifications"> });
                      if (n.link) router.push(n.link);
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-lg text-foreground ${
                                !n.read ? "font-bold" : "font-semibold"
                              }`}
                            >
                              {tDb(t, "notifications", n._id, "title", n.title)}
                            </h3>
                            {!n.read && (
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <p className="text-slate-500">
                            {tDb(t, "notifications", n._id, "message", n.message)}
                          </p>
                          <div className="flex items-center gap-3 text-sm">
                            <Badge variant="outline" className="capitalize neo-elevated-sm border-0 rounded-lg">
                              {n.type.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-slate-400">
                              {new Date(n.createdAt).toLocaleDateString(i18n.language, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {n.link && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="neo-elevated-sm rounded-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(n.link!);
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="neo-elevated-sm rounded-xl text-slate-400 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotif({ notificationId: n._id as Id<"notifications"> });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
