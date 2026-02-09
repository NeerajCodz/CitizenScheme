"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, ArrowRight, Building2, User, Sparkles, FileSearch, ScanFace, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"user" | "org">("user");

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const supabase = createClient();
      const callbackPath = mode === "org" ? "/api/auth/callback?next=/organization/onboarding" : "/api/auth/callback";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${callbackPath}`,
        },
      });
      if (error) throw error;
    } catch {
      toast.error("Failed to initiate login. Please try again.");
      setLoading(false);
    }
  }

  const heroFeatures = [
    { icon: FileSearch, title: "AI-Powered OCR", desc: "Upload Aadhaar or Voter ID — AI extracts your details instantly." },
    { icon: ScanFace, title: "Face Verification", desc: "Quick 3-angle selfie for secure identity verification." },
    { icon: Sparkles, title: "Smart Matching", desc: "Get personalized scheme recommendations based on your profile." },
    { icon: CheckCircle2, title: "Real-time Updates", desc: "Live notifications for scheme changes and application status." },
  ];

  const orgFeatures = [
    { icon: Building2, title: "Create Schemes", desc: "Propose new welfare schemes for eligible citizens." },
    { icon: Sparkles, title: "Target Audience", desc: "Set eligibility rules to reach the right beneficiaries." },
    { icon: CheckCircle2, title: "Admin Review", desc: "Schemes are reviewed and approved by platform admins." },
  ];

  // Hero content panel
  const HeroPanel = ({ forOrg = false }: { forOrg?: boolean }) => (
    <div className="flex h-full flex-col justify-center p-8 lg:p-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2">
        <div className="neo-convex flex h-10 w-10 items-center justify-center rounded-xl">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xl font-bold tracking-tight">Citizen Copilot</span>
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
        {forOrg
          ? <>Empower Citizens Through <span className="text-primary/70">Your Schemes</span></>
          : <>Discover Government Benefits <span className="text-primary/70">You Deserve</span></>
        }
      </h1>
      <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
        {forOrg
          ? "Register your organization, propose welfare schemes, and help citizens find benefits they qualify for."
          : "Upload your ID, verify your identity, and let our AI engine match you with every government welfare scheme you're eligible for."
        }
      </p>

      <div className="mt-10 space-y-4">
        {(forOrg ? orgFeatures : heroFeatures).map((f) => (
          <div key={f.title} className="flex items-start gap-3">
            <div className="neo-convex flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5">
              <f.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Login form panel
  const LoginPanel = ({ isOrg = false }: { isOrg?: boolean }) => (
    <div className="flex h-full flex-col items-center justify-center p-8 lg:p-16">
      <div className="w-full max-w-sm">
        <div className="neo-card p-8">
          <div className="mb-6 text-center">
            <div className="neo-convex mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
              {isOrg ? <Building2 className="h-7 w-7 text-primary" /> : <User className="h-7 w-7 text-primary" />}
            </div>
            <h2 className="text-xl font-bold">
              {isOrg ? "Organization Login" : "Welcome Back"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isOrg
                ? "Sign in to manage your organization and schemes."
                : "Sign in to discover government benefits you're eligible for."
              }
            </p>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="neo-btn w-full h-12 rounded-xl font-medium text-foreground bg-transparent hover:bg-transparent"
            variant="ghost"
            size="lg"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing in you agree to our terms. Your data is securely stored and never shared.
          </p>
        </div>

        {/* Toggle mode */}
        <button
          onClick={() => setMode(isOrg ? "user" : "org")}
          className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {isOrg ? (
            <>
              <User className="h-4 w-4" />
              Login as a citizen
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4" />
              Login as an organization
            </>
          )}
          <ArrowRight className="h-3 w-3" />
        </button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {mode === "user" ? (
          <motion.div
            key="user-layout"
            className="flex min-h-screen w-full flex-col lg:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Left: Hero content */}
            <div className="hidden lg:flex lg:w-1/2 border-r border-border/40 bg-muted/20">
              <HeroPanel />
            </div>
            {/* Right: Login form */}
            <div className="flex flex-1 lg:w-1/2">
              <LoginPanel />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="org-layout"
            className="flex min-h-screen w-full flex-col lg:flex-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Left: Login form (for org) */}
            <div className="flex flex-1 lg:w-1/2">
              <LoginPanel isOrg />
            </div>
            {/* Right: Hero content (for org) */}
            <div className="hidden lg:flex lg:w-1/2 border-l border-border/40 bg-muted/20">
              <HeroPanel forOrg />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
