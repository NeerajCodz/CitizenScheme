"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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

const Chatbot = dynamic(
  () => import("@/components/chatbot/Chatbot"),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SchemeDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [scheme, setScheme] = useState<SchemeRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchScheme = useCallback(async () => {
    try {
      // Check if user is admin
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!scheme) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={scheme.eligibility_score >= 80 ? "success" : scheme.eligibility_score >= 50 ? "warning" : "secondary"}>
              {scheme.eligibility_score}% match
            </Badge>
            <Badge variant="outline">{scheme.category}</Badge>
            {scheme.state ? (
              <Badge variant="outline">
                <MapPin className="mr-1 h-3 w-3" />
                {scheme.state}
              </Badge>
            ) : (
              <Badge variant="outline">
                <Globe className="mr-1 h-3 w-3" />
                National
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">{scheme.scheme_name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {scheme.description}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">{scheme.benefits}</p>
              </CardContent>
            </Card>

            {/* Eligibility Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Breakdown</CardTitle>
                <CardDescription>
                  Based on your profile information
                </CardDescription>
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
                    <h4 className="mb-2 text-sm font-medium text-green-600">
                      Matching Criteria
                    </h4>
                    <div className="space-y-1">
                      {scheme.matching_criteria.map((c) => (
                        <div key={c} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{c}</span>
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
                      {scheme.missing_criteria.map((c) => (
                        <div key={c} className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Process */}
            {scheme.application_process && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line leading-relaxed">
                    {scheme.application_process}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" /> Apply
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAdmin ? (
                  <div className="flex flex-col items-center gap-2 text-center p-4 bg-orange-50 rounded-lg border border-primary/20">
                    <Shield className="h-8 w-8 text-primary" />
                    <p className="font-medium text-foreground">Admin Account</p>
                    <p className="text-sm text-muted-foreground">
                      Only organizations and citizens can apply to schemes. Admins manage and oversee applications.
                    </p>
                  </div>
                ) : applied ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll be notified about the status.
                    </p>
                  </div>
                ) : (
                  <Button
                    className="w-full"
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
            </Card>

            {/* Scheme Info */}
            <Card>
              <CardHeader>
                <CardTitle>Scheme Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{scheme.department}</span>
                </div>
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
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Official Website
                    </a>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Required Documents */}
            {scheme.eligibility_rules.required_documents &&
              scheme.eligibility_rules.required_documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {scheme.eligibility_rules.required_documents.map((d) => (
                        <li
                          key={d}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            <Link href="/home">
              <Button variant="outline" className="w-full">
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
