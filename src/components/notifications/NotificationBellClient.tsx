"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function NotificationBellClient() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Convex queries - safe to call here since this component is client-only
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    userId ? { userId } : "skip"
  );

  return (
    <Link href="/notifications">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative rounded-full hover:bg-primary/10 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}

export default NotificationBellClient;
