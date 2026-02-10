"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Briefcase,
  IndianRupee,
  FileText,
  Download,
  Eye,
} from "lucide-react";

interface ApplicationDetail {
  id: string;
  user_id: string;
  scheme_id: string;
  status: string;
  eligibility_score: number;
  eligibility_details: Record<string, boolean>;
  form_responses: Record<string, string | number | boolean>;
  documents: { url: string; name: string; field_id: string }[];
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  applied_at: string;
  schemes: {
    id: string;
    scheme_name: string;
    slug: string;
    scheme_type: string;
    application_form_fields: Array<{ id: string; label: string; type: string }>;
  } | null;
  user_profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    state: string | null;
    avatar_url: string | null;
    date_of_birth: string | null;
    gender: string | null;
    caste_category: string | null;
    occupation: string | null;
    annual_income: number | null;
    onboarding_completed: boolean;
    id_verified: boolean;
    face_verified: boolean;
  } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/organization/applications/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setApplication(json.application);
        setReviewNotes(json.application.review_notes || "");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/organization/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, review_notes: reviewNotes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Application ${status}`);
      setApplication((prev) => prev ? { ...prev, status, review_notes: reviewNotes } : null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Application not found</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const profile = application.user_profiles;
  const scheme = application.schemes;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Application Review</h1>
          <p className="text-sm text-muted-foreground">
            {scheme?.scheme_name} — Applied {new Date(application.applied_at).toLocaleDateString("en-IN")}
          </p>
        </div>
        <Badge
          variant={
            application.status === "approved" ? "success" :
            application.status === "rejected" ? "destructive" :
            application.status === "under_review" ? "warning" : "secondary"
          }
          className="text-sm"
        >
          {application.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Applicant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{profile?.full_name || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{profile?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{profile?.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">State:</span>
                  <span className="font-medium">{profile?.state || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">DOB:</span>
                  <span className="font-medium">{profile?.date_of_birth || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium capitalize">{profile?.gender || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium uppercase">{profile?.caste_category || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Occupation:</span>
                  <span className="font-medium">{profile?.occupation || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Income:</span>
                  <span className="font-medium">
                    {profile?.annual_income ? `₹${profile.annual_income.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex gap-2">
                <Badge variant={profile?.id_verified ? "success" : "secondary"}>
                  {profile?.id_verified ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                  ID {profile?.id_verified ? "Verified" : "Not Verified"}
                </Badge>
                <Badge variant={profile?.face_verified ? "success" : "secondary"}>
                  {profile?.face_verified ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                  Face {profile?.face_verified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Custom Form Responses */}
          {application.form_responses && Object.keys(application.form_responses).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Application Form Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(application.form_responses).map(([key, value]) => {
                    const fieldDef = scheme?.application_form_fields?.find((f) => f.id === key);
                    return (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground min-w-[120px]">
                          {fieldDef?.label || key}:
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uploaded Documents */}
          {application.documents && application.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Uploaded Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="mr-1 h-4 w-4" /> Download
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-4">
          {/* Eligibility Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Eligibility Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-600">{application.eligibility_score}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Review Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full neo-btn-primary"
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={updating || application.status === "approved"}
                >
                  {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Approve
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleStatusUpdate("under_review")}
                  disabled={updating || application.status === "under_review"}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Mark Under Review
                </Button>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={updating || application.status === "rejected"}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
              {application.reviewed_at && (
                <p className="text-xs text-muted-foreground text-center">
                  Last reviewed: {new Date(application.reviewed_at).toLocaleDateString("en-IN")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
