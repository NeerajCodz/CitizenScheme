"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Building2,
  Palette,
  Bell,
  Globe,
  MapPin,
  Mail,
  Image,
} from "lucide-react";

interface OrgData {
  id: string;
  name: string;
  description: string;
  work_email: string;
  website: string;
  address: string;
  state: string;
  district: string;
  logo_url: string;
  banner_url: string;
  settings: {
    notification_email: boolean;
    notification_inapp: boolean;
    primary_color: string;
    auto_approve: boolean;
  } | null;
}

export default function OrgSettingsPage() {
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [tab, setTab] = useState<"profile" | "branding" | "notifications">("profile");

  const [profile, setProfile] = useState({
    name: "", description: "", work_email: "", website: "",
    address: "", state: "", district: "",
  });

  const [branding, setBranding] = useState({
    logo_url: "", banner_url: "",
  });

  const [notifications, setNotifications] = useState({
    notification_email: true,
    notification_inapp: true,
    auto_approve: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/organization");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        const o = json.organization;
        setOrg(o);
        setProfile({
          name: o.name || "",
          description: o.description || "",
          work_email: o.work_email || "",
          website: o.website || "",
          address: o.address || "",
          state: o.state || "",
          district: o.district || "",
        });
        setBranding({
          logo_url: o.logo_url || "",
          banner_url: o.banner_url || "",
        });
        if (o.settings) {
          setNotifications({
            notification_email: o.settings.notification_email ?? true,
            notification_inapp: o.settings.notification_inapp ?? true,
            auto_approve: o.settings.auto_approve ?? false,
          });
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const saveSection = async (section: string, data: Record<string, unknown>) => {
    setSaving(section);
    try {
      const body: Record<string, unknown> = {};
      if (section === "profile") {
        Object.assign(body, data);
      } else if (section === "branding") {
        Object.assign(body, data);
      } else if (section === "notifications") {
        body.settings = data;
      }

      const res = await fetch("/api/organization/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} saved!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Organization Settings</h1>

      {/* Tab Buttons */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { key: "profile", label: "Profile", icon: Building2 },
          { key: "branding", label: "Branding", icon: Palette },
          { key: "notifications", label: "Notifications", icon: Bell },
        ].map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab(t.key as typeof tab)}
            className={tab === t.key ? "neo-btn-primary" : ""}
          >
            <t.icon className="mr-2 h-4 w-4" /> {t.label}
          </Button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Organization Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={profile.description}
                onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Work Email
                </Label>
                <Input
                  type="email"
                  value={profile.work_email}
                  onChange={(e) => setProfile((p) => ({ ...p, work_email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Website
                </Label>
                <Input
                  value={profile.website}
                  onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Address
              </Label>
              <Input
                value={profile.address}
                onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={profile.state}
                  onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  value={profile.district}
                  onChange={(e) => setProfile((p) => ({ ...p, district: e.target.value }))}
                />
              </div>
            </div>
            <Separator />
            <Button
              className="neo-btn-primary"
              onClick={() => saveSection("profile", profile)}
              disabled={saving === "profile"}
            >
              {saving === "profile" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Branding Tab */}
      {tab === "branding" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" /> Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Image className="h-3 w-3" /> Logo URL
              </Label>
              <Input
                value={branding.logo_url}
                onChange={(e) => setBranding((b) => ({ ...b, logo_url: e.target.value }))}
                placeholder="https://..."
              />
              {branding.logo_url && (
                <div className="mt-2 flex h-20 w-20 items-center justify-center rounded border bg-muted">
                  <img
                    src={branding.logo_url}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Image className="h-3 w-3" /> Banner URL
              </Label>
              <Input
                value={branding.banner_url}
                onChange={(e) => setBranding((b) => ({ ...b, banner_url: e.target.value }))}
                placeholder="https://..."
              />
              {branding.banner_url && (
                <div className="mt-2 h-32 overflow-hidden rounded border">
                  <img
                    src={branding.banner_url}
                    alt="Banner preview"
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
            <Separator />
            <Button
              className="neo-btn-primary"
              onClick={() => saveSection("branding", branding)}
              disabled={saving === "branding"}
            >
              {saving === "branding" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Branding
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email when new applications arrive
                </p>
              </div>
              <Switch
                checked={notifications.notification_email}
                onCheckedChange={(v) =>
                  setNotifications((n) => ({ ...n, notification_email: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">In-App Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Show notifications within the platform
                </p>
              </div>
              <Switch
                checked={notifications.notification_inapp}
                onCheckedChange={(v) =>
                  setNotifications((n) => ({ ...n, notification_inapp: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Approve Applications</p>
                <p className="text-sm text-muted-foreground">
                  Automatically approve applications with high eligibility scores
                </p>
              </div>
              <Switch
                checked={notifications.auto_approve}
                onCheckedChange={(v) =>
                  setNotifications((n) => ({ ...n, auto_approve: v }))
                }
              />
            </div>
            <Separator />
            <Button
              className="neo-btn-primary"
              onClick={() => saveSection("notifications", notifications)}
              disabled={saving === "notifications"}
            >
              {saving === "notifications" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
