"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";
import {
  Loader2,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ArrowRight,
  FileText,
  TrendingUp,
  Building2,
  Users,
} from "lucide-react";

const Chatbot = dynamic(() => import("@/components/chatbot/Chatbot"), {
  ssr: false,
});

interface Application {
  id: string;
  scheme_id: string;
  status: string;
  eligibility_score: number;
  applied_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
  schemes: {
    id: string;
    scheme_name: string;
    slug: string;
    scheme_type: string;
    category: string;
    department: string | null;
  } | null;
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/applications");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setApplications(json.applications || []);
      } catch {
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string; variant: "success" | "destructive" | "warning" | "secondary" }> = {
    pending: { icon: Clock, color: "text-yellow-600", label: "Pending", variant: "secondary" },
    under_review: { icon: Eye, color: "text-purple-600", label: "Under Review", variant: "warning" },
    approved: { icon: CheckCircle2, color: "text-emerald-600", label: "Approved", variant: "success" },
    rejected: { icon: XCircle, color: "text-red-500", label: "Rejected", variant: "destructive" },
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    under_review: applications.filter((a) => a.status === "under_review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
          <p className="mt-1 text-slate-500">
            Track the status of your scheme applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-4 mb-8">
          {[
            { label: "Total", value: stats.total, icon: ClipboardList, color: "text-blue-600" },
            { label: "Pending", value: stats.pending + stats.under_review, icon: Clock, color: "text-yellow-600" },
            { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="neo-elevated-lg rounded-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardContent>
            </div>
          ))}
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No applications yet</h3>
              <p className="text-muted-foreground">
                Browse schemes and apply to get started.
              </p>
              <Link href="/schemes">
                <Button>
                  Browse Schemes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const scheme = app.schemes;
              const config = statusConfig[app.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const isPrivate = scheme?.scheme_type === "private";

              return (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Scheme Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/scheme/${scheme?.slug || ""}`}
                            className="text-base font-semibold hover:text-primary transition-colors truncate"
                          >
                            {scheme?.scheme_name || "Unknown Scheme"}
                          </Link>
                          <Badge
                            className={`text-[10px] shrink-0 ${
                              isPrivate
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-orange-500 text-white border-orange-500"
                            }`}
                          >
                            {isPrivate ? (
                              <><Users className="mr-1 h-2.5 w-2.5" />Org</>
                            ) : (
                              <><Building2 className="mr-1 h-2.5 w-2.5" />Govt</>
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {scheme?.category && (
                            <Badge variant="outline" className="text-[10px]">
                              {scheme.category}
                            </Badge>
                          )}
                          <span>Applied {new Date(app.applied_at).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-2 shrink-0">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Score</span>
                            <span className="font-medium">{app.eligibility_score}%</span>
                          </div>
                          <Progress value={app.eligibility_score} className="h-1.5" />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={config.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Review Notes */}
                    {app.review_notes && (
                      <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
                        <span className="font-medium">Review Note: </span>
                        {app.review_notes}
                      </div>
                    )}

                    {app.reviewed_at && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Reviewed on {new Date(app.reviewed_at).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
}

