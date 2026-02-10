"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Building2, Loader2, ArrowRight, Shield } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
  "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
];

export default function OrgOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    work_email: "",
    website: "",
    address: "",
    state: "",
    district: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Organization name is required.");
      return;
    }
    if (!form.work_email.trim()) {
      toast.error("Work email is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success("Organization registered! Redirecting to dashboard...");
      router.push("/organization/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]">
      <header className="border-b border-white/40 dark:border-white/10 bg-[#f0f0f3]/80 dark:bg-[hsl(240,10%,10%)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
          <Shield className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-foreground">Organization Onboarding</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="neo-elevated-lg rounded-2xl p-8">
          <div className="mb-8 text-center">
            <div className="neo-elevated mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
              <Building2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Register Your Organization</h1>
            <p className="mt-2 text-sm text-slate-500">
              Complete your organization profile to start proposing welfare schemes.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Organization Name *</Label>
              <Input
                className="neo-inset border-0"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Rural Development Foundation"
              />
            </div>

            <div className="space-y-2">
              <Label>Work Email *</Label>
              <Input
                className="neo-inset border-0"
                type="email"
                value={form.work_email}
                onChange={(e) => update("work_email", e.target.value)}
                placeholder="contact@organization.org"
              />
              <p className="text-xs text-muted-foreground">
                No verification needed — just provide a valid work email for contact.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                className="neo-inset border-0"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                placeholder="What does your organization do?"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  className="neo-inset border-0"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={form.state} onValueChange={(v) => update("state", v)}>
                  <SelectTrigger className="neo-inset border-0">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  className="neo-inset border-0"
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                  placeholder="e.g. Coimbatore"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  className="neo-inset border-0"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Street address"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 rounded-xl neo-btn-primary"
              size="lg"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {loading ? "Registering..." : "Complete Registration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
