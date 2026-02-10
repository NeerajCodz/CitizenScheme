"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  AlignLeft,
} from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "textarea" | "file" | "select" | "date" | "number" | "checkbox";
  label: string;
  required: boolean;
  placeholder: string;
  options: string[];
  validation: Record<string, unknown>;
}

interface SchemeData {
  id: string;
  scheme_name: string;
  scheme_code: string;
  description: string;
  benefits: string;
  department: string;
  state: string | null;
  category: string;
  official_website: string;
  is_active: boolean;
  eligibility_rules: {
    age?: { min?: number; max?: number };
    income?: { max?: number };
    gender?: string;
    caste_category?: string;
    occupation?: string;
  };
  application_form_fields: FormField[];
}

const CATEGORIES = [
  "Agriculture", "Healthcare", "Housing", "Energy", "Education",
  "Finance", "Social Welfare", "Women & Child", "Disability",
];

const INDIAN_STATES = [
  "All India", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
  "Jammu and Kashmir", "Ladakh",
];

const FIELD_TYPES = [
  { value: "text", label: "Short Text", icon: Type },
  { value: "textarea", label: "Long Text", icon: AlignLeft },
  { value: "number", label: "Number", icon: Hash },
  { value: "date", label: "Date", icon: Calendar },
  { value: "select", label: "Dropdown", icon: List },
  { value: "file", label: "File Upload", icon: FileText },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SchemeEditorPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheme, setScheme] = useState<SchemeData | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // Flat form state
  const [form, setForm] = useState({
    scheme_name: "",
    scheme_code: "",
    description: "",
    benefits: "",
    department: "",
    state: "",
    category: "",
    official_website: "",
    is_active: true,
    age_min: "",
    age_max: "",
    income_max: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/organization/schemes/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        const s = json.scheme;
        setScheme(s);
        setFormFields(s.application_form_fields || []);
        setForm({
          scheme_name: s.scheme_name || "",
          scheme_code: s.scheme_code || "",
          description: s.description || "",
          benefits: s.benefits || "",
          department: s.department || "",
          state: s.state || "All India",
          category: s.category || "",
          official_website: s.official_website || "",
          is_active: s.is_active ?? true,
          age_min: s.eligibility_rules?.age?.min?.toString() || "",
          age_max: s.eligibility_rules?.age?.max?.toString() || "",
          income_max: s.eligibility_rules?.income?.max?.toString() || "",
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Load failed";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addField = () => {
    const newField: FormField = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `f_${Date.now()}`,
      type: "text",
      label: "",
      required: false,
      placeholder: "",
      options: [],
      validation: {},
    };
    setFormFields((prev) => [...prev, newField]);
  };

  const updateField = (fieldId: string, key: keyof FormField, value: unknown) => {
    setFormFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, [key]: value } : f))
    );
  };

  const removeField = (fieldId: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const handleSave = async () => {
    if (!form.scheme_name.trim()) {
      toast.error("Scheme name is required");
      return;
    }

    setSaving(true);
    try {
      const eligibility_rules: Record<string, unknown> = {};
      if (form.age_min || form.age_max) {
        eligibility_rules.age = {};
        if (form.age_min) (eligibility_rules.age as Record<string, number>).min = Number(form.age_min);
        if (form.age_max) (eligibility_rules.age as Record<string, number>).max = Number(form.age_max);
      }
      if (form.income_max) eligibility_rules.income = { max: Number(form.income_max) };

      // Validate form fields
      for (const f of formFields) {
        if (!f.label.trim()) {
          toast.error("All form fields must have a label");
          setSaving(false);
          return;
        }
      }

      const res = await fetch(`/api/organization/schemes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme_name: form.scheme_name,
          scheme_code: form.scheme_code,
          description: form.description,
          benefits: form.benefits,
          department: form.department,
          state: form.state === "All India" ? null : form.state || null,
          category: form.category,
          official_website: form.official_website,
          is_active: form.is_active,
          eligibility_rules,
          application_form_fields: formFields,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success("Scheme updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const fieldIcon = (type: string) => {
    const ft = FIELD_TYPES.find((t) => t.value === type);
    return ft ? ft.icon : Type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Scheme not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-bold">Edit Scheme</h1>
        </div>
        <Button
          className="neo-btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Scheme Name *</Label>
              <Input value={form.scheme_name} onChange={(e) => update("scheme_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Scheme Code</Label>
              <Input value={form.scheme_code} onChange={(e) => update("scheme_code", e.target.value)} />
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} onChange={(e) => update("department", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.official_website} onChange={(e) => update("official_website", e.target.value)} />
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
              <Label>State</Label>
              <Select value={form.state} onValueChange={(v) => update("state", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_active} onCheckedChange={(v) => update("is_active", v)} />
            <Label>Scheme is Active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle>Eligibility Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Minimum Age</Label>
              <Input type="number" value={form.age_min} onChange={(e) => update("age_min", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Maximum Age</Label>
              <Input type="number" value={form.age_max} onChange={(e) => update("age_max", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Max Income (₹)</Label>
              <Input type="number" value={form.income_max} onChange={(e) => update("income_max", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Builder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Application Form Builder</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Define the custom fields applicants need to fill out when applying for this scheme.
              </p>
            </div>
            <Button onClick={addField} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formFields.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No custom fields yet. Add fields to create an application form.
              </p>
              <Button onClick={addField} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add First Field
              </Button>
            </div>
          ) : (
            formFields.map((field, index) => {
              const Icon = fieldIcon(field.type);
              return (
                <Card key={field.id} className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <div className="mt-2 cursor-grab text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-green-100 text-xs font-bold text-emerald-700">
                            {index + 1}
                          </span>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground uppercase">
                            {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Field Label *</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.id, "label", e.target.value)}
                              placeholder="e.g. Aadhaar Number"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(v) => updateField(field.id, "type", v)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Placeholder</Label>
                            <Input
                              value={field.placeholder}
                              onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                              placeholder="Placeholder text"
                              className="h-9"
                            />
                          </div>
                          <div className="flex items-end gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(v) => updateField(field.id, "required", v)}
                              />
                              <Label className="text-xs">Required</Label>
                            </div>
                          </div>
                        </div>
                        {field.type === "select" && (
                          <div className="space-y-1">
                            <Label className="text-xs">Options (comma separated)</Label>
                            <Input
                              value={field.options.join(", ")}
                              onChange={(e) =>
                                updateField(
                                  field.id,
                                  "options",
                                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                )
                              }
                              placeholder="Option A, Option B, Option C"
                              className="h-9"
                            />
                          </div>
                        )}
                        {field.type === "file" && (
                          <div className="space-y-1">
                            <Label className="text-xs">File Hint</Label>
                            <Input
                              value={field.placeholder}
                              onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                              placeholder="e.g. Upload PDF only, max 5MB"
                              className="h-9"
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-red-500 hover:text-red-700"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          className="neo-btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
