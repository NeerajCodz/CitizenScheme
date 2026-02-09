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

export default function NotificationsPage() {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Notifications</h1>
              </div>
            </div>
            {unreadCount && unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => userId && markAllRead({ userId })}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {!notifications || notifications.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
              <p className="text-muted-foreground text-center max-w-md">
                When you receive notifications about schemes, applications, or updates,
                they&apos;ll appear here.
              </p>
            </CardContent>
          </Card>
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
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !n.read
                        ? "border-2 border-primary/20 bg-primary/5"
                        : "border hover:border-primary/20"
                    }`}
                    onClick={() => {
                      if (!n.read) markRead({ notificationId: n._id as Id<"notifications"> });
                      if (n.link) router.push(n.link);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-lg ${
                                !n.read ? "font-bold" : "font-semibold"
                              }`}
                            >
                              {n.title}
                            </h3>
                            {!n.read && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-muted-foreground">{n.message}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <Badge variant="outline" className="capitalize">
                              {n.type.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-muted-foreground">
                              {new Date(n.createdAt).toLocaleDateString("en-IN", {
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
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotif({ notificationId: n._id as Id<"notifications"> });
                            }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
