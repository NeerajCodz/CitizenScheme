"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Send, Bell, Users, MapPin, Briefcase } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh",
];

const CASTE_CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
const OCCUPATIONS = ["Student", "Farmer", "Self-Employed", "Salaried", "Business", "Unemployed", "Homemaker", "Retired"];
const NOTIFICATION_TYPES = [
  { value: "admin_message", label: "Admin Message" },
  { value: "scheme_update", label: "Scheme Update" },
  { value: "new_scheme", label: "New Scheme" },
];

const TARGET_TYPES = [
  { value: "all", label: "All Users", icon: Users, description: "Send to all verified users" },
  { value: "state", label: "By State", icon: MapPin, description: "Target users in a specific state" },
  { value: "caste", label: "By Category", icon: Users, description: "Target users of a specific caste category" },
  { value: "occupation", label: "By Occupation", icon: Briefcase, description: "Target users with a specific occupation" },
  { value: "individual", label: "Individual", icon: Bell, description: "Send to a specific user by ID" },
];

export default function AdminNotificationsPage() {
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "admin_message",
    link: "",
    targetType: "all",
    targetValue: "",
  });

  const handleSend = async () => {
    if (!form.title || !form.message) {
      toast.error("Title and message are required.");
      return;
    }
    if (form.targetType !== "all" && !form.targetValue) {
      toast.error("Please specify a target value.");
      return;
    }

    setSending(true);
    setSentCount(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          type: form.type,
          link: form.link || undefined,
          target: {
            type: form.targetType,
            value: form.targetValue || undefined,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSentCount(json.sent);
      toast.success(`Notification sent to ${json.sent} user(s)!`);
      setForm({ title: "", message: "", type: "admin_message", link: "", targetType: "all", targetValue: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send notification";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const selectedTarget = TARGET_TYPES.find((t) => t.value === form.targetType);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Send Notifications</h1>
        <p className="text-muted-foreground">
          Send targeted notifications to users via Convex real-time system.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notification Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compose Notification</CardTitle>
            <CardDescription>
              Fill in the details and choose your target audience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Notification title"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Notification message..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Link (optional)</Label>
              <Input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="/scheme/pm-kisan or https://..."
              />
            </div>

            {/* Target Selection */}
            <div className="space-y-3">
              <Label>Target Audience</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {TARGET_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setForm({ ...form, targetType: t.value, targetValue: "" })}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      form.targetType === t.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <t.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Value */}
            {form.targetType === "state" && (
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={form.targetValue} onValueChange={(v) => setForm({ ...form, targetValue: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.targetType === "caste" && (
              <div className="space-y-2">
                <Label>Caste Category</Label>
                <Select value={form.targetValue} onValueChange={(v) => setForm({ ...form, targetValue: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASTE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.targetType === "occupation" && (
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Select value={form.targetValue} onValueChange={(v) => setForm({ ...form, targetValue: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCUPATIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.targetType === "individual" && (
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                  value={form.targetValue}
                  onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                  placeholder="Supabase user UUID"
                />
              </div>
            )}

            <Button onClick={handleSend} disabled={sending} className="w-full" size="lg">
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {sending ? "Sending..." : "Send Notification"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview + Status */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">
                    {form.title || "Notification Title"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {form.message || "Notification message will appear here..."}
                </p>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    {form.type.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {selectedTarget?.label || "All"}
                    {form.targetValue ? `: ${form.targetValue}` : ""}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {sentCount !== null && (
            <Card>
              <CardContent className="py-6 text-center">
                <div className="text-3xl font-bold text-green-600">{sentCount}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Notifications sent successfully
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
