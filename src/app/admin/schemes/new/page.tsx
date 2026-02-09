"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Agriculture",
  "Healthcare",
  "Housing",
  "Energy",
  "Education",
  "Finance",
  "Social Welfare",
  "Women & Child",
  "Disability",
];

function NewSchemeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  const [form, setForm] = useState({
    scheme_name: "",
    scheme_code: "",
    description: "",
    benefits: "",
    department: "",
    state: "",
    category: "",
    application_process: "",
    official_website: "",
    // Eligibility rules (flat for form)
    age_min: "",
    age_max: "",
    income_max: "",
    gender: [] as string[],
    caste: [] as string[],
  });

  // Fetch existing scheme if editing
  useEffect(() => {
    if (!editId) return;
    async function fetchScheme() {
      try {
        const res = await fetch("/api/admin/schemes");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        const scheme = (json.schemes || []).find(
          (s: { id: string }) => s.id === editId
        );
        if (scheme) {
          setForm({
            scheme_name: scheme.scheme_name || "",
            scheme_code: scheme.scheme_code || "",
            description: scheme.description || "",
            benefits: scheme.benefits || "",
            department: scheme.department || "",
            state: scheme.state || "",
            category: scheme.category || "",
            application_process: scheme.application_process || "",
            official_website: scheme.official_website || "",
            age_min: scheme.eligibility_rules?.age?.min?.toString() || "",
            age_max: scheme.eligibility_rules?.age?.max?.toString() || "",
            income_max: scheme.eligibility_rules?.income?.max?.toString() || "",
            gender: scheme.eligibility_rules?.gender || [],
            caste: scheme.eligibility_rules?.caste || [],
          });
        }
      } catch {
        toast.error("Failed to load scheme");
      } finally {
        setFetching(false);
      }
    }
    fetchScheme();
  }, [editId]);

  const handleSubmit = async () => {
    if (!form.scheme_name || !form.scheme_code || !form.category) {
      toast.error("Please fill in required fields (name, code, category).");
      return;
    }

    setLoading(true);
    try {
      const eligibility_rules: Record<string, unknown> = {};
      if (form.age_min || form.age_max) {
        eligibility_rules.age = {};
        if (form.age_min)
          (eligibility_rules.age as Record<string, number>).min = Number(form.age_min);
        if (form.age_max)
          (eligibility_rules.age as Record<string, number>).max = Number(form.age_max);
      }
      if (form.income_max)
        eligibility_rules.income = { max: Number(form.income_max) };
      if (form.gender.length > 0) eligibility_rules.gender = form.gender;
      if (form.caste.length > 0) eligibility_rules.caste = form.caste;

      const payload = {
        ...(editId ? { id: editId } : {}),
        scheme_name: form.scheme_name,
        scheme_code: form.scheme_code,
        description: form.description,
        benefits: form.benefits,
        department: form.department,
        state: form.state || null,
        category: form.category,
        application_process: form.application_process || null,
        official_website: form.official_website || null,
        eligibility_rules,
      };

      const res = await fetch("/api/admin/schemes", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success(editId ? "Scheme updated!" : "Scheme created!");
      router.push("/admin/schemes");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save scheme";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/admin/schemes")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schemes
      </Button>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{editId ? "Edit Scheme" : "Create New Scheme"}</CardTitle>
          <CardDescription>
            {editId
              ? "Update scheme details and eligibility rules."
              : "Add a new government scheme to the platform."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Scheme Name *</Label>
              <Input
                value={form.scheme_name}
                onChange={(e) => updateForm("scheme_name", e.target.value)}
                placeholder="e.g. PM-KISAN Samman Nidhi"
              />
            </div>
            <div className="space-y-2">
              <Label>Scheme Code *</Label>
              <Input
                value={form.scheme_code}
                onChange={(e) => updateForm("scheme_code", e.target.value)}
                placeholder="e.g. PM-KISAN"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => updateForm("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={form.department}
                onChange={(e) => updateForm("department", e.target.value)}
                placeholder="e.g. Ministry of Agriculture"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={3}
              placeholder="Brief description of the scheme..."
            />
          </div>

          <div className="space-y-2">
            <Label>Benefits</Label>
            <Textarea
              value={form.benefits}
              onChange={(e) => updateForm("benefits", e.target.value)}
              rows={3}
              placeholder="What benefits does this scheme provide?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>State (blank = National)</Label>
              <Input
                value={form.state}
                onChange={(e) => updateForm("state", e.target.value)}
                placeholder="e.g. Tamil Nadu"
              />
            </div>
            <div className="space-y-2">
              <Label>Official Website</Label>
              <Input
                value={form.official_website}
                onChange={(e) => updateForm("official_website", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Application Process</Label>
            <Textarea
              value={form.application_process}
              onChange={(e) => updateForm("application_process", e.target.value)}
              rows={2}
            />
          </div>

          {/* Eligibility Rules */}
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-semibold">Eligibility Rules</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Min Age</Label>
                <Input
                  type="number"
                  value={form.age_min}
                  onChange={(e) => updateForm("age_min", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Age</Label>
                <Input
                  type="number"
                  value={form.age_max}
                  onChange={(e) => updateForm("age_max", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Income (₹)</Label>
                <Input
                  type="number"
                  value={form.income_max}
                  onChange={(e) => updateForm("income_max", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {loading
              ? "Saving..."
              : editId
                ? "Update Scheme"
                : "Create Scheme"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewSchemePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <NewSchemeForm />
    </Suspense>
  );
}
