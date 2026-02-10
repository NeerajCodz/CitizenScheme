"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { tDb } from "@/lib/dbI18n";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  MapPin,
  Globe,
  Shield,
  Send,
} from "lucide-react";
import type { SchemeRecommendation } from "@/lib/types";
import { CustomApplicationForm } from "@/components/scheme/CustomApplicationForm";
import { ThemeToggle } from "@/components/ThemeToggle";

const Chatbot = dynamic(() => import("@/components/chatbot/Chatbot"), {
  ssr: false,
});

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SchemeDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  const [scheme, setScheme] = useState<SchemeRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const fetchScheme = useCallback(async () => {
    try {
      const adminRes = await fetch("/api/admin/users");
      if (adminRes.ok) {
        setIsAdmin(true);
      }

      const res = await fetch("/api/schemes/recommend");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const found = json.recommendations.find(
        (r: SchemeRecommendation) => r.slug === slug
      );
      if (found) {
        setScheme(found);
      } else {
        toast.error("Scheme not found");
        router.push("/home");
      }
    } catch {
      toast.error("Failed to load scheme");
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    fetchScheme();
  }, [fetchScheme]);

  const handleApply = async () => {
    if (!scheme) return;
    if (scheme.scheme_type === "government") {
      if (scheme.official_website) {
        window.open(scheme.official_website, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Official website not available");
      }
      return;
    }
    // Private scheme: check if it has custom form fields
    const formFields = (scheme as unknown as { application_form_fields?: unknown[] }).application_form_fields;
    if (formFields && formFields.length > 0) {
      setShowApplicationForm(true);
      return;
    }
    // No custom form — direct apply
    setApplying(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheme_id: scheme.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setApplied(true);
      toast.success("Application submitted successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Application failed";
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!scheme) return null;

  const schemeId = scheme.id || scheme.slug || scheme.scheme_name;
  const name = tDb(t, "schemes", schemeId, "scheme_name", scheme.scheme_name);
  const description = tDb(
    t,
    "schemes",
    schemeId,
    "description",
    scheme.description
  );
  const benefits = tDb(t, "schemes", schemeId, "benefits", scheme.benefits);
  const category = tDb(t, "schemes", schemeId, "category", scheme.category);
  const state = scheme.state
    ? tDb(t, "schemes", schemeId, "state", scheme.state)
    : null;
  const applicationProcess = scheme.application_process
    ? tDb(
        t,
        "schemes",
        schemeId,
        "application_process",
        scheme.application_process
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/40 dark:border-white/10 bg-[#f0f0f3]/80 dark:bg-[hsl(240,10%,10%)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="neo-elevated-sm rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant={
                scheme.eligibility_score >= 80
                  ? "success"
                  : scheme.eligibility_score >= 50
                    ? "warning"
                    : "secondary"
              }
            >
              {scheme.eligibility_score}% match
            </Badge>
            <Badge
              className={
                scheme.scheme_type === "government"
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-emerald-600 text-white border-emerald-600"
              }
            >
              {scheme.scheme_type === "government" ? (
                <><Building2 className="mr-1 h-3 w-3" />Govt</>
              ) : (
                <><Building2 className="mr-1 h-3 w-3" />Organization</>
              )}
            </Badge>
            <Badge variant="outline">{category}</Badge>
            {scheme.state ? (
              <Badge variant="outline">
                <MapPin className="mr-1 h-3 w-3" />
                {state}
              </Badge>
            ) : (
              <Badge variant="outline">
                <Globe className="mr-1 h-3 w-3" />
                National
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{name}</h1>
          <p className="mt-2 text-lg text-slate-500">{description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Benefits */}
            <div className="neo-elevated-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-foreground">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">{benefits}</p>
              </CardContent>
            </div>

            {/* Eligibility Breakdown */}
            <div className="neo-elevated-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-foreground">Eligibility Breakdown</CardTitle>
                <CardDescription>Based on your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Score</span>
                  <span className="text-2xl font-bold">
                    {scheme.eligibility_score}%
                  </span>
                </div>
                <Progress value={scheme.eligibility_score} />

                {scheme.matching_criteria.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-emerald-600">
                      Matching Criteria
                    </h4>
                    <div className="space-y-1">
                      {scheme.matching_criteria.map((c, idx) => (
                        <div key={c} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>
                            {tDb(
                              t,
                              "schemes",
                              schemeId,
                              `matching_criteria.${idx}`,
                              c
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scheme.missing_criteria.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-red-500">
                      Missing / Not Matching
                    </h4>
                    <div className="space-y-1">
                      {scheme.missing_criteria.map((c, idx) => (
                        <div key={c} className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>
                            {tDb(
                              t,
                              "schemes",
                              schemeId,
                              `missing_criteria.${idx}`,
                              c
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </div>

            {/* Application Process */}
            {applicationProcess && (
              <div className="neo-elevated-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Application Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line leading-relaxed">
                    {applicationProcess}
                  </p>
                </CardContent>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <div className="neo-elevated-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Send className="h-5 w-5" /> Apply
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAdmin ? (
                  <div className="flex flex-col items-center gap-2 text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Shield className="h-8 w-8 text-emerald-600" />
                    <p className="font-medium text-foreground">Admin Account</p>
                    <p className="text-sm text-slate-500">
                      Only organizations and citizens can apply to schemes. Admins manage and oversee applications.
                    </p>
                  </div>
                ) : applied ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll be notified about the status.
                    </p>
                  </div>
                ) : scheme.scheme_type === "government" ? (
                  <Button
                    className="w-full neo-btn-orange"
                    size="lg"
                    onClick={handleApply}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Official Website
                  </Button>
                ) : (
                  <Button
                    className="w-full neo-btn-primary"
                    size="lg"
                    onClick={handleApply}
                    disabled={applying}
                  >
                    {applying ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {applying ? "Submitting..." : "Apply for this Scheme"}
                  </Button>
                )}
              </CardContent>
            </div>

            {/* Custom Application Form (for private schemes) */}
            {showApplicationForm && !applied && (() => {
              const formFields = (scheme as unknown as { application_form_fields?: Array<{ id: string; type: "text" | "textarea" | "file" | "select" | "date" | "number" | "checkbox"; label: string; required: boolean; placeholder: string; options: string[]; validation: Record<string, unknown> }> }).application_form_fields;
              return formFields && formFields.length > 0 ? (
                <CustomApplicationForm
                  schemeId={scheme.id}
                  schemeName={name}
                  formFields={formFields}
                  onSuccess={() => setApplied(true)}
                />
              ) : null;
            })()}

            {/* Scheme Info */}
            <div className="neo-elevated-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-foreground">Scheme Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scheme.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {tDb(
                        t,
                        "schemes",
                        schemeId,
                        "department",
                        scheme.department
                      )}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Code: {scheme.scheme_code}</span>
                </div>
                {scheme.official_website && (
                  <>
                    <Separator />
                    <a
                      href={scheme.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Official Website
                    </a>
                  </>
                )}
              </CardContent>
            </div>

            {/* Required Documents */}
            {scheme.eligibility_rules.required_documents &&
              scheme.eligibility_rules.required_documents.length > 0 && (
                <div className="neo-elevated-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-foreground">Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {scheme.eligibility_rules.required_documents.map((d, idx) => (
                        <li key={d} className="flex items-center gap-2 text-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {tDb(
                            t,
                            "schemes",
                            schemeId,
                            `required_documents.${idx}`,
                            d
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
              )}

            <Link href="/home">
              <Button variant="outline" className="w-full neo-elevated rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schemes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
}
