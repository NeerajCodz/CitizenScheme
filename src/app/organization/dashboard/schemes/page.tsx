"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Pencil,
  Users,
} from "lucide-react";

const CATEGORIES = [
  "Agriculture", "Healthcare", "Housing", "Energy", "Education",
  "Finance", "Social Welfare", "Women & Child", "Disability",
];

const INDIAN_STATES = [
  "All India",
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh",
];

interface SchemeRequest {
  id: string;
  scheme_data: Record<string, unknown>;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface SchemeStat {
  id: string;
  scheme_name: string;
  slug: string;
  is_active: boolean;
  scheme_type: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function OrgSchemesPage() {
  const [schemes, setSchemes] = useState<SchemeStat[]>([]);
  const [requests, setRequests] = useState<SchemeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"active" | "requests">("active");

  const [form, setForm] = useState({
    scheme_name: "", scheme_code: "", description: "", benefits: "",
    department: "", state: "", category: "", application_process: "",
    official_website: "",
    age_min: "", age_max: "", income_max: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [analyticsRes, reqRes] = await Promise.all([
        fetch("/api/organization/analytics"),
        fetch("/api/organization/schemes"),
      ]);
      const analyticsJson = await analyticsRes.json();
      const reqJson = await reqRes.json();
      setSchemes(analyticsJson.schemeStats || []);
      setRequests(reqJson.requests || []);
    } catch {
      toast.error("Failed to load schemes");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitScheme = async () => {
    if (!form.scheme_name.trim()) {
      toast.error("Scheme name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const eligibility_rules: Record<string, unknown> = {};
      if (form.age_min || form.age_max) {
        eligibility_rules.age = {};
        if (form.age_min) (eligibility_rules.age as Record<string, number>).min = Number(form.age_min);
        if (form.age_max) (eligibility_rules.age as Record<string, number>).max = Number(form.age_max);
      }
      if (form.income_max) eligibility_rules.income = { max: Number(form.income_max) };

      const res = await fetch("/api/organization/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          state: form.state === "All India" ? null : form.state || null,
          eligibility_rules,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success("Scheme request submitted for admin review!");
      setDialogOpen(false);
      setForm({
        scheme_name: "", scheme_code: "", description: "", benefits: "",
        department: "", state: "", category: "", application_process: "",
        official_website: "", age_min: "", age_max: "", income_max: "",
      });
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const statusIcon = (s: string) => {
    if (s === "approved") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (s === "rejected") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const filteredSchemes = schemes.filter((s) =>
    s.scheme_name.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold">Schemes</h1>
        <div className="flex gap-2">
          <Button
            variant={tab === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("active")}
            className={tab === "active" ? "neo-btn-primary" : ""}
          >
            <FileText className="mr-1 h-4 w-4" />
            Active ({schemes.length})
          </Button>
          <Button
            variant={tab === "requests" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("requests")}
            className={tab === "requests" ? "neo-btn-primary" : ""}
          >
            <Clock className="mr-1 h-4 w-4" />
            Requests ({requests.length})
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="neo-btn-primary">
                <Plus className="mr-2 h-4 w-4" /> New Scheme
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Propose a New Scheme</DialogTitle>
                <DialogDescription>
                  Fill in the details below. The admin will review your request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Scheme Name *</Label>
                    <Input value={form.scheme_name} onChange={(e) => update("scheme_name", e.target.value)} placeholder="Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Scheme Code</Label>
                    <Input value={form.scheme_code} onChange={(e) => update("scheme_code", e.target.value)} placeholder="Code" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => update("category", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={form.state} onValueChange={(v) => update("state", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <Textarea value={form.benefits} onChange={(e) => update("benefits", e.target.value)} rows={2} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Min Age</Label>
                    <Input type="number" value={form.age_min} onChange={(e) => update("age_min", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Age</Label>
                    <Input type="number" value={form.age_max} onChange={(e) => update("age_max", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Income (₹)</Label>
                    <Input type="number" value={form.income_max} onChange={(e) => update("income_max", e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={form.department} onChange={(e) => update("department", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={form.official_website} onChange={(e) => update("official_website", e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <Button onClick={handleSubmitScheme} disabled={submitting} className="w-full neo-btn-primary" size="lg">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  {submitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search schemes..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {tab === "active" ? (
        <div className="grid gap-3">
          {filteredSchemes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No active schemes</p>
                <p className="text-sm text-muted-foreground">
                  Propose a new scheme to get started. Admin will review and approve it.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSchemes.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{s.scheme_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={s.is_active ? "success" : "secondary"} className="text-[10px]">
                          {s.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-700 dark:text-emerald-400">Private</Badge>
                      </div>
                    </div>
                    <Link href={`/organization/dashboard/schemes/${s.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{s.total} total</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Clock className="h-4 w-4" />
                      <span>{s.pending} pending</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{s.approved} approved</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <XCircle className="h-4 w-4" />
                      <span>{s.rejected} rejected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No scheme requests yet.
              </CardContent>
            </Card>
          ) : (
            requests.map((r) => {
              const sd = r.scheme_data as Record<string, string>;
              return (
                <Card key={r.id}>
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {statusIcon(r.status)}
                        <h3 className="font-semibold">{sd.scheme_name || "Unnamed"}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{sd.description || "No description"}</p>
                      {r.admin_notes && (
                        <p className="mt-2 text-xs text-muted-foreground italic">Admin: {r.admin_notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={r.status === "approved" ? "success" : r.status === "rejected" ? "destructive" : "secondary"}>
                        {r.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
