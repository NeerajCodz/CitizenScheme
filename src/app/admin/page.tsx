"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, FileText, ClipboardList, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  totalSchemes: number;
  totalApplications: number;
  verifiedUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, schemesRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/schemes"),
        ]);
        const users = await usersRes.json();
        const schemes = await schemesRes.json();

        if (!usersRes.ok || !schemesRes.ok) throw new Error("Failed to fetch");

        const profiles = users.users || [];
        setStats({
          totalUsers: profiles.length,
          totalSchemes: (schemes.schemes || []).length,
          totalApplications: 0, // Would need a dedicated endpoint
          verifiedUsers: profiles.filter(
            (p: { onboarding_completed: boolean }) => p.onboarding_completed
          ).length,
        });
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Verified Users",
      value: stats?.verifiedUsers ?? 0,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Active Schemes",
      value: stats?.totalSchemes ?? 0,
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Applications",
      value: stats?.totalApplications ?? 0,
      icon: ClipboardList,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.title}
              </CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
