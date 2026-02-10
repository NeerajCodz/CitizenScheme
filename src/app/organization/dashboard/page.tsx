"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Building2,
  Loader2,
  FileText,
  ClipboardList,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  Users,
} from "lucide-react";

interface Analytics {
  totalSchemes: number;
  activeSchemes: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  recentApplications: Array<{
    id: string;
    scheme_id: string;
    status: string;
    applied_at: string;
    user_profiles: { full_name: string | null; email: string | null } | null;
  }>;
  schemeStats: Array<{
    id: string;
    scheme_name: string;
    slug: string;
    is_active: boolean;
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>;
}

interface Organization {
  id: string;
  name: string;
  work_email: string;
  verified: boolean;
  logo_url: string | null;
  description: string | null;
}

export default function OrgDashboardPage() {
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [orgRes, analyticsRes] = await Promise.all([
          fetch("/api/organization"),
          fetch("/api/organization/analytics"),
        ]);
        const orgJson = await orgRes.json();
        const analyticsJson = await analyticsRes.json();

        if (!orgJson.organization) {
          router.push("/organization/onboarding");
          return;
        }

        setOrg(orgJson.organization);
        setAnalytics(analyticsJson);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!org || !analytics) return null;

  const statCards = [
    { title: "Total Schemes", value: analytics.totalSchemes, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Total Applications", value: analytics.totalApplications, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Pending Review", value: analytics.pendingApplications, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { title: "Approved", value: analytics.approvedApplications, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Org Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl neo-elevated">
            <Building2 className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
              <Badge variant={org.verified ? "success" : "secondary"}>
                {org.verified ? "Verified" : "Pending"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{org.work_email}</p>
          </div>
        </div>
        <Link href="/organization/dashboard/schemes">
          <Button className="neo-btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Scheme
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.title} className="neo-elevated-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {c.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{c.value}</div>
            </CardContent>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Schemes */}
        <div className="neo-elevated-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">Your Schemes</CardTitle>
            <Link href="/organization/dashboard/schemes">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {analytics.schemeStats.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No schemes yet. Create your first scheme!</p>
                <Link href="/organization/dashboard/schemes">
                  <Button size="sm" className="neo-btn-primary">
                    <Plus className="mr-2 h-4 w-4" /> Create Scheme
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.schemeStats.slice(0, 5).map((s) => (
                  <Link key={s.id} href={`/organization/dashboard/schemes/${s.id}/edit`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{s.scheme_name}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{s.total} apps</span>
                          {s.pending > 0 && (
                            <Badge variant="warning" className="text-[10px] px-1.5 py-0">{s.pending} pending</Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={s.is_active ? "success" : "secondary"} className="text-[10px]">
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </div>

        {/* Recent Applications */}
        <div className="neo-elevated-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">Recent Applications</CardTitle>
            <Link href="/organization/dashboard/applications">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {analytics.recentApplications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.recentApplications.map((app) => {
                  const profile = app.user_profiles as { full_name: string | null; email: string | null } | null;
                  return (
                    <Link key={app.id} href={`/organization/dashboard/applications/${app.id}`}>
                      <div className="flex items-center justify-between rounded-lg neo-elevated-sm p-3 hover:neo-inset transition-all cursor-pointer">
                        <div>
                          <p className="font-medium text-sm">{profile?.full_name || profile?.email || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(app.applied_at).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <Badge
                          variant={
                            app.status === "approved" ? "success" :
                            app.status === "rejected" ? "destructive" :
                            app.status === "under_review" ? "warning" : "secondary"
                          }
                        >
                          {app.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </div>
      </div>

      {/* Performance Overview */}
      {analytics.totalApplications > 0 && (
        <div className="neo-elevated-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4 rounded-lg neo-inset">
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                  {analytics.totalApplications > 0
                    ? Math.round((analytics.approvedApplications / analytics.totalApplications) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Approval Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg neo-inset">
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{analytics.activeSchemes}</p>
                <p className="text-sm text-slate-500 mt-1">Active Schemes</p>
              </div>
              <div className="text-center p-4 rounded-lg neo-inset">
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{analytics.pendingApplications}</p>
                <p className="text-sm text-slate-500 mt-1">Awaiting Review</p>
              </div>
            </div>
          </CardContent>
        </div>
      )}
    </div>
  );
}
