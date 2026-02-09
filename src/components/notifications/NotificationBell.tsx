"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

// Dynamically import the actual notification bell to avoid SSR issues with Convex
const NotificationBellClient = dynamic(
  () => import("@/components/notifications/NotificationBellClient"),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon" className="relative neo-flat">
        <Bell className="h-5 w-5" />
      </Button>
    ),
  }
);

export default function NotificationBell() {
  return <NotificationBellClient />;
}
