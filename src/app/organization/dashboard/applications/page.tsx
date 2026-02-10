"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Users,
} from "lucide-react";

interface Application {
  id: string;
  user_id: string;
  scheme_id: string;
  status: string;
  eligibility_score: number;
  applied_at: string;
  schemes: { id: string; scheme_name: string; slug: string; scheme_type: string } | null;
  user_profiles: { id: string; full_name: string | null; email: string | null; phone: string | null; state: string | null } | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  under_review: number;
}

export default function OrgApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, under_review: 0 });
  const [schemes, setSchemes] = useState<{ id: string; scheme_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schemeFilter, setSchemeFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, [statusFilter, schemeFilter]);

  async function loadData() {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (schemeFilter !== "all") params.set("scheme_id", schemeFilter);

      const res = await fetch(`/api/organization/applications?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setApplications(json.applications || []);
      setStats(json.stats || { total: 0, pending: 0, approved: 0, rejected: 0, under_review: 0 });
      setSchemes(json.schemes || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  const filtered = applications.filter((app) => {
    const profile = app.user_profiles;
    const name = profile?.full_name || profile?.email || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const statusBadge = (status: string) => {
    const variants: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
      approved: "success",
      rejected: "destructive",
      under_review: "warning",
      pending: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-5">
        {[
          { label: "Total", value: stats.total, icon: ClipboardList, color: "text-blue-600" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600" },
          { label: "Under Review", value: stats.under_review, icon: Eye, color: "text-purple-600" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {schemes.length > 0 && (
          <Select value={schemeFilter} onValueChange={setSchemeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Scheme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schemes</SelectItem>
              {schemes.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.scheme_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Scheme</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Applied</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => {
                    const profile = app.user_profiles;
                    const scheme = app.schemes;
                    return (
                      <tr key={app.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{profile?.full_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{profile?.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{scheme?.scheme_name || "—"}</td>
                        <td className="p-4">
                          <span className="font-medium">{app.eligibility_score}%</span>
                        </td>
                        <td className="p-4">{statusBadge(app.status)}</td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(app.applied_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-4">
                          <Link href={`/organization/dashboard/applications/${app.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="mr-1 h-4 w-4" /> View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
