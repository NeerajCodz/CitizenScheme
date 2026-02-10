"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Send,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
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

interface CustomApplicationFormProps {
  schemeId: string;
  schemeName: string;
  formFields: FormField[];
  onSuccess: () => void;
}

export function CustomApplicationForm({
  schemeId,
  schemeName,
  formFields,
  onSuccess,
}: CustomApplicationFormProps) {
  const [responses, setResponses] = useState<Record<string, string | number | boolean>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "review" | "done">("form");

  const updateResponse = (fieldId: string, value: string | number | boolean) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setFiles((prev) => ({ ...prev, [fieldId]: file }));
      updateResponse(fieldId, file.name);
    }
  };

  const validateForm = (): boolean => {
    for (const field of formFields) {
      if (field.required) {
        const value = responses[field.id];
        if (field.type === "checkbox") {
          if (!value) {
            toast.error(`"${field.label}" must be checked`);
            return false;
          }
        } else if (field.type === "file") {
          if (!files[field.id]) {
            toast.error(`"${field.label}" file is required`);
            return false;
          }
        } else if (!value || String(value).trim() === "") {
          toast.error(`"${field.label}" is required`);
          return false;
        }
      }
    }
    return true;
  };

  const handleReview = () => {
    if (!validateForm()) return;
    setStep("review");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Upload files first
      const uploadedDocs: { url: string; name: string; field_id: string }[] = [];
      const fileFields = formFields.filter((f) => f.type === "file" && files[f.id]);

      if (fileFields.length > 0) {
        setUploading(true);
        for (const field of fileFields) {
          const file = files[field.id];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("bucket", "documents");
          formData.append("path", `applications/${schemeId}`);

          const uploadRes = await fetch("/api/upload/faces", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            uploadedDocs.push({
              url: uploadJson.url || uploadJson.path || "",
              name: file.name,
              field_id: field.id,
            });
          } else {
            // If upload fails, store filename as reference
            uploadedDocs.push({
              url: "",
              name: file.name,
              field_id: field.id,
            });
          }
        }
        setUploading(false);
      }

      // Submit application
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme_id: schemeId,
          form_responses: responses,
          documents: uploadedDocs,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setStep("done");
      toast.success("Application submitted successfully!");
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (step === "done") {
    return (
      <Card className="border-green-200 bg-emerald-50 dark:bg-emerald-900/20/50">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <h3 className="text-xl font-bold text-green-800">Application Submitted!</h3>
          <p className="text-sm text-emerald-700">
            Your application for <strong>{schemeName}</strong> has been submitted.
            You&apos;ll be notified when it&apos;s reviewed.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === "review") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Review Your Application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please review your responses before submitting.
          </p>
          <div className="space-y-3 rounded-lg border p-4">
            {formFields.map((field) => {
              const value = responses[field.id];
              return (
                <div key={field.id} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground min-w-[140px] font-medium">
                    {field.label}:
                  </span>
                  <span>
                    {field.type === "checkbox"
                      ? value ? "Yes" : "No"
                      : field.type === "file"
                        ? files[field.id]?.name || "—"
                        : String(value || "—")}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
              Edit Responses
            </Button>
            <Button
              className="flex-1 neo-btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? "Uploading files..." : "Submitting..."}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Confirm & Submit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          Application Form
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Fill in the required information to apply for this scheme.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {formFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>

            {field.type === "text" && (
              <Input
                value={String(responses[field.id] || "")}
                onChange={(e) => updateResponse(field.id, e.target.value)}
                placeholder={field.placeholder}
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                value={String(responses[field.id] || "")}
                onChange={(e) => updateResponse(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
              />
            )}

            {field.type === "number" && (
              <Input
                type="number"
                value={String(responses[field.id] || "")}
                onChange={(e) => updateResponse(field.id, e.target.value ? Number(e.target.value) : "")}
                placeholder={field.placeholder}
              />
            )}

            {field.type === "date" && (
              <Input
                type="date"
                value={String(responses[field.id] || "")}
                onChange={(e) => updateResponse(field.id, e.target.value)}
              />
            )}

            {field.type === "select" && (
              <Select
                value={String(responses[field.id] || "")}
                onValueChange={(v) => updateResponse(field.id, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "checkbox" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={!!responses[field.id]}
                  onCheckedChange={(v) => updateResponse(field.id, !!v)}
                />
                <span className="text-sm text-muted-foreground">{field.placeholder}</span>
              </div>
            )}

            {field.type === "file" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 hover:border-green-500 hover:bg-emerald-50 dark:bg-emerald-900/20/50 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {files[field.id] ? files[field.id].name : "Choose file..."}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                {field.placeholder && (
                  <p className="text-xs text-muted-foreground">{field.placeholder}</p>
                )}
              </div>
            )}
          </div>
        ))}

        <Button
          className="w-full neo-btn-primary"
          size="lg"
          onClick={handleReview}
        >
          Review Application
        </Button>
      </CardContent>
    </Card>
  );
}

