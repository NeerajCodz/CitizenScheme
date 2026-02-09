"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  Building2,
  Plus,
  Loader2,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

interface Organization {
  id: string;
  name: string;
  work_email: string;
  verified: boolean;
  state: string | null;
}

export default function OrgDashboardPage() {
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [requests, setRequests] = useState<SchemeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    scheme_name: "", scheme_code: "", description: "", benefits: "",
    department: "", state: "", category: "", application_process: "",
    official_website: "",
    age_min: "", age_max: "", income_max: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const [orgRes, reqRes] = await Promise.all([
          fetch("/api/organization"),
          fetch("/api/organization/schemes"),
        ]);
        const orgJson = await orgRes.json();
        const reqJson = await reqRes.json();

        if (!orgJson.organization) {
          router.push("/organization/onboarding");
          return;
        }

        setOrg(orgJson.organization);
        setRequests(reqJson.requests || []);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

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

      // Refresh requests
      const reqRes = await fetch("/api/organization/schemes");
      const reqJson = await reqRes.json();
      setRequests(reqJson.requests || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const statusIcon = (s: string) => {
    if (s === "approved") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (s === "rejected") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/organization/dashboard" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold">Org Dashboard</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Org header */}
        <div className="neo-card mb-8 flex items-center gap-4 p-6">
          <div className="neo-convex flex h-14 w-14 items-center justify-center rounded-2xl">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{org?.name}</h1>
            <p className="text-sm text-muted-foreground">{org?.work_email}</p>
          </div>
          <Badge variant={org?.verified ? "success" : "secondary"}>
            {org?.verified ? "Verified" : "Pending Verification"}
          </Badge>
        </div>

        {/* Actions */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Scheme Requests ({requests.length})</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Scheme</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Propose a New Scheme</DialogTitle>
                <DialogDescription>
                  Fill in the details below. All fields are optional except the scheme name.
                  The admin will review your request.
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
                <Button onClick={handleSubmitScheme} disabled={submitting} className="w-full" size="lg">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  {submitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Requests list */}
        {requests.length === 0 ? (
          <div className="neo-card flex flex-col items-center gap-4 p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No scheme requests yet</p>
            <p className="text-sm text-muted-foreground">Click &quot;New Scheme&quot; to propose your first welfare scheme.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const sd = r.scheme_data as Record<string, string>;
              return (
                <div key={r.id} className="neo-card flex items-start justify-between gap-4 p-5">
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
