"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  ScanFace,
  FileSearch,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Users,
  IndianRupee,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "AI-Powered OCR",
    description:
      "Upload your Aadhaar or Voter ID — our AI instantly extracts your details with Gemini Vision.",
  },
  {
    icon: ScanFace,
    title: "Face Verification",
    description:
      "Quick 3-angle selfie capture ensures your identity is verified securely.",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description:
      "Get personalized scheme suggestions based on your exact profile and eligibility.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data is encrypted and stored securely with Supabase. We never share your information.",
  },
];

const stats = [
  { icon: Globe, value: "10+", label: "Government Schemes" },
  { icon: Users, value: "100%", label: "Free to Use" },
  { icon: IndianRupee, value: "₹6L+", label: "Avg. Benefits Value" },
];

const steps = [
  {
    step: "01",
    title: "Sign In with Google",
    description: "One-click secure authentication to get started.",
  },
  {
    step: "02",
    title: "Upload Your ID",
    description: "Aadhaar, Voter ID, or other government IDs.",
  },
  {
    step: "03",
    title: "Verify Your Face",
    description: "Quick 3-angle selfie for identity verification.",
  },
  {
    step: "04",
    title: "Get Recommendations",
    description: "See all welfare schemes you are eligible for.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Citizen Copilot
            </span>
          </Link>
          <Link href="/login">
            <Button>
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--color-primary)/0.08,transparent)]" />
        <div className="mx-auto max-w-6xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              AI-Powered Welfare Discovery
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Discover Government Benefits{" "}
              <span className="text-primary">You Deserve</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Upload your ID, verify your identity, and let our AI engine match
              you with every government welfare scheme you&apos;re eligible for
              — in minutes.
            </p>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/login">
              <Button size="lg" className="text-base">
                Start Now — It&apos;s Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base">
                How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">
              Everything You Need in One Place
            </h2>
            <p className="mt-3 text-muted-foreground">
              From document scanning to scheme matching — we handle it all.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground">
              Four simple steps to unlock your benefits.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative"
              >
                <div className="mb-3 text-4xl font-extrabold text-primary/20">
                  {s.step}
                </div>
                <h3 className="mb-1 font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {s.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligible Schemes Preview */}
      <section className="border-t border-border/50 bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold">Sample Schemes We Cover</h2>
          <p className="mt-3 mb-10 text-muted-foreground">
            National and state-level schemes, automatically matched to your
            profile.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "PM-KISAN Samman Nidhi",
              "Ayushman Bharat (PMJAY)",
              "PM Awas Yojana",
              "PM Ujjwala Yojana",
              "National Scholarship Portal",
              "Sukanya Samriddhi Yojana",
            ].map((name, i) => (
              <motion.div
                key={name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="border-border/50 bg-card">
                  <CardContent className="flex items-center gap-3 py-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                    <span className="text-sm font-medium">{name}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-primary p-12 text-primary-foreground"
          >
            <h2 className="text-3xl font-bold">
              Ready to Find Your Benefits?
            </h2>
            <p className="mx-auto mt-3 max-w-lg opacity-90">
              Join thousands of citizens who have already discovered schemes
              they were eligible for but didn&apos;t know about.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="mt-8 text-base"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Citizen Copilot. Built for
            citizens, by citizens.
          </p>
          <p className="mt-1">
            Not affiliated with any government body. Information is for guidance
            only.
          </p>
        </div>
      </footer>
    </div>
  );
}
