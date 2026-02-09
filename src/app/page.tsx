"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Zap,
  Lock,
  TrendingUp,
  Award,
  Clock,
  Heart,
  Star,
  Target,
  Rocket,
  Brain,
  LightbulbIcon,
  MessageSquare,
  BarChart3,
  Radio,
  Fingerprint,
  Eye,
  CheckCheck,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    icon: FileSearch,
    title: "AI-Powered OCR",
    description:
      "Upload your Aadhaar or Voter ID — our AI instantly extracts your details with Gemini Vision.",
    color: "from-orange-400 to-orange-600",
  },
  {
    icon: ScanFace,
    title: "Face Verification",
    description:
      "Quick 3-angle selfie capture ensures your identity is verified securely.",
    color: "from-blue-400 to-blue-600",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description:
      "Get personalized scheme suggestions based on your exact profile and eligibility.",
    color: "from-purple-400 to-purple-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data is encrypted and stored securely with Supabase. We never share your information.",
    color: "from-green-400 to-green-600",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description:
      "Get results in seconds with our lightning-fast AI processing engine.",
    color: "from-yellow-400 to-yellow-600",
  },
  {
    icon: Brain,
    title: "Smart Matching",
    description:
      "Advanced algorithms ensure you never miss an eligible scheme.",
    color: "from-pink-400 to-pink-600",
  },
];

const stats = [
  { icon: Globe, value: "10+", label: "Government Schemes", color: "text-orange-500" },
  { icon: Users, value: "100%", label: "Free to Use", color: "text-green-500" },
  { icon: IndianRupee, value: "₹6L+", label: "Avg. Benefits Value", color: "text-blue-500" },
  { icon: Award, value: "99%", label: "Accuracy Rate", color: "text-purple-500" },
];

const steps = [
  {
    step: "01",
    title: "Sign In with Google",
    description: "One-click secure authentication to get started.",
    icon: Users,
  },
  {
    step: "02",
    title: "Upload Your ID",
    description: "Aadhaar, Voter ID, or other government IDs.",
    icon: FileSearch,
  },
  {
    step: "03",
    title: "Verify Your Face",
    description: "Quick 3-angle selfie for identity verification.",
    icon: Fingerprint,
  },
  {
    step: "04",
    title: "Get Recommendations",
    description: "See all welfare schemes you are eligible for.",
    icon: Sparkles,
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Save Time",
    description: "No more endless paperwork and government office visits",
  },
  {
    icon: Target,
    title: "Perfect Match",
    description: "AI ensures you find all schemes you qualify for",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "Your data is encrypted and never shared with third parties",
  },
  {
    icon: TrendingUp,
    title: "Maximize Benefits",
    description: "Discover schemes worth lakhs that you didn't know existed",
  },
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Farmer, Maharashtra",
    quote: "I discovered 3 schemes I never knew about. Got ₹50,000 in benefits!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Student, Delhi",
    quote: "The scholarship finder is amazing. I got full tuition coverage!",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Small Business Owner",
    quote: "Simple, fast, and actually works. Highly recommended!",
    rating: 5,
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

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50/40 via-background to-emerald-50/30 text-foreground overflow-hidden">
      {/* Navigation - Neomorphic */}
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/60 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="neo-pressed flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-linear-to-r from-primary to-orange-700 bg-clip-text text-transparent">
              Citizen Copilot
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button className="neo-btn group px-8 py-6 text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
                Get Started 
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Neomorphic Extravaganza */}
      <section className="relative overflow-hidden py-32">
        {/* Animated Floating Elements */}
        <motion.div 
          style={{ opacity, scale }}
          className="absolute inset-0 -z-10"
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </motion.div>

        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="neo-card inline-flex items-center gap-2 px-6 py-3 mb-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Radio className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                AI-Powered Welfare Discovery Platform
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block">Discover Government Benefits</span>
              <span className="block mt-2 bg-linear-to-r from-primary via-orange-600 to-orange-700 bg-clip-text text-transparent">
                You Actually Deserve
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mt-8 max-w-3xl text-xl text-muted-foreground leading-relaxed">
              Upload your ID, verify your identity with cutting-edge AI, and discover 
              <span className="font-bold text-primary"> every government welfare scheme </span>
              you&apos;re eligible for — all in just 
              <span className="font-bold text-primary"> 2 minutes</span>.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link href="/login">
              <Button size="lg" className="neo-btn group px-10 py-7 text-lg font-bold shadow-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
                <Rocket className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                Start Free Now
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="neo-convex px-10 py-7 text-lg font-bold border-2 border-primary text-primary hover:bg-primary/10">
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Hero Stats - Neomorphic Dashboard */}
          <motion.div
            className="mx-auto mt-20 max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="neo-card p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="neo-pressed p-6 rounded-xl text-center hover:neo-convex transition-all cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  <s.icon className={`mx-auto mb-3 h-8 w-8 ${s.color} transition-transform group-hover:scale-110`} />
                  <div className="text-3xl font-black bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                    {s.value}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground mt-1">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features - 3D Neomorphic Cards */}
      <section className="py-32 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="neo-pressed inline-block px-6 py-2 rounded-full text-sm font-bold text-primary mb-4">
                Powerful Features
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                Everything You Need,
                <span className="block mt-2 bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                  Nothing You Don&apos;t
                </span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Cutting-edge AI technology meets intuitive design for the ultimate welfare discovery experience.
              </p>
            </motion.div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="neo-card h-full p-8 group hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  {/* Icon with gradient */}
                  <div className="neo-flat mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <f.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                    Learn more 
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits - Alternating Neomorphic Layout */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black">
              Why Citizens 
              <span className="block mt-2 bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Love Us
              </span>
            </h2>
          </motion.div>

          <div className="space-y-16">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col md:flex-row items-center gap-12 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="neo-card p-12 max-w-md hover:scale-105 transition-all duration-300 cursor-pointer">
                    <h3 className="text-2xl font-black mb-4 text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="neo-flat p-16 rounded-3xl relative">
                    <div className="neo-pressed w-48 h-48 rounded-3xl flex items-center justify-center">
                      <benefit.icon className="h-24 w-24 text-primary animate-float" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - Interactive Timeline */}
      <section id="how-it-works" className="py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="neo-pressed inline-block px-6 py-2 rounded-full text-sm font-bold text-primary mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black">
              Get Started in 
              <span className="block mt-2 bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                4 Easy Steps
              </span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process gets you from signup to scheme recommendations in under 2 minutes.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline connector */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 neo-pressed -translate-y-1/2" />
            
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 relative">
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
                  <div className="neo-card p-8 text-center group hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                    {/* Step number badge */}
                    <div className="neo-flat absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl flex items-center justify-center bg-primary text-white font-black text-xl shadow-2xl group-hover:scale-110 transition-transform">
                      {s.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="mt-6 neo-flat inline-flex p-6 rounded-2xl mb-6 transition-all group-hover:scale-110 group-hover:neo-convex">
                      <s.icon className="h-10 w-10 text-primary" />
                    </div>
                    
                    <h3 className="mb-3 text-lg font-bold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Neomorphic Cards */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="neo-pressed inline-block px-6 py-2 rounded-full text-sm font-bold text-primary mb-4">
              Success Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-black">
              Real People,
              <span className="block mt-2 bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Real Benefits
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="neo-card p-8 h-full group hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="h-5 w-5 fill-orange-400 text-orange-400 group-hover:scale-110 transition-transform" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <MessageSquare className="h-8 w-8 text-primary/30 mb-4 group-hover:text-primary/50 transition-colors" />
                  <p className="text-foreground font-medium leading-relaxed mb-6 italic">
                    &quot;{t.quote}&quot;
                  </p>
                  
                  {/* Author */}
                  <div className="neo-pressed p-4 rounded-xl group-hover:neo-flat transition-all">
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligible Schemes Preview - Neomorphic Grid */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="neo-pressed inline-block px-6 py-2 rounded-full text-sm font-bold text-primary mb-4">
              Popular Schemes
            </span>
            <h2 className="text-4xl md:text-5xl font-black">
              Schemes We Cover
              <span className="block mt-2 bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                For Every Citizen
              </span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              National and state-level schemes, automatically matched to your profile with AI precision.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "PM-KISAN Samman Nidhi", icon: IndianRupee, color: "from-green-400 to-green-600" },
              { name: "Ayushman Bharat (PMJAY)", icon: Heart, color: "from-red-400 to-red-600" },
              { name: "PM Awas Yojana", icon: Shield, color: "from-blue-400 to-blue-600" },
              { name: "PM Ujjwala Yojana", icon: Zap, color: "from-orange-400 to-orange-600" },
              { name: "National Scholarship Portal", icon: Award, color: "from-purple-400 to-purple-600" },
              { name: "Sukanya Samriddhi Yojana", icon: Star, color: "from-pink-400 to-pink-600" },
            ].map((scheme, i) => (
              <motion.div
                key={scheme.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="neo-card p-6 group hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4">
                    <div className={`neo-flat p-4 rounded-xl shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6 ${
                      scheme.name.includes('KISAN') ? 'bg-green-100' :
                      scheme.name.includes('Ayushman') ? 'bg-red-100' :
                      scheme.name.includes('Awas') ? 'bg-blue-100' :
                      scheme.name.includes('Ujjwala') ? 'bg-orange-100' :
                      scheme.name.includes('Scholarship') ? 'bg-purple-100' :
                      'bg-pink-100'
                    }`}>
                      <scheme.icon className={`h-6 w-6 ${
                        scheme.name.includes('KISAN') ? 'text-green-600' :
                        scheme.name.includes('Ayushman') ? 'text-red-600' :
                        scheme.name.includes('Awas') ? 'text-blue-600' :
                        scheme.name.includes('Ujjwala') ? 'text-orange-600' :
                        scheme.name.includes('Scholarship') ? 'text-purple-600' :
                        'text-pink-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm leading-tight text-foreground">{scheme.name}</h3>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/schemes">
              <Button size="lg" variant="outline" className="neo-btn px-8 py-6 text-base font-semibold border-2 border-primary text-primary hover:bg-primary/10">
                View All Schemes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators - Neomorphic Badges */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="neo-card p-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black mb-12">
              Trusted by Citizens 
              <span className="block mt-2 bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Across India
              </span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Shield, label: "256-bit Encryption", sublabel: "Bank-grade Security" },
                { icon: CheckCheck, label: "99% Accuracy", sublabel: "AI-Powered Matching" },
                { icon: Clock, label: "2 Min Setup", sublabel: "Lightning Fast" },
                { icon: Users, label: "100% Free", sublabel: "Always Free to Use" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="neo-pressed p-8 rounded-2xl group hover:scale-110 hover:neo-flat transition-all duration-300 cursor-pointer"
                >
                  <item.icon className="h-12 w-12 mx-auto mb-4 text-primary transition-all group-hover:scale-125 group-hover:text-accent" />
                  <div className="font-bold text-lg mb-1 text-foreground">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.sublabel}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Feature Showcase */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black">
              Advanced Technology
              <span className="block mt-2 bg-linear-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tab Cards */}
            <div className="space-y-4">
              {[
                { icon: Brain, title: "AI-Powered Matching", description: "Advanced algorithms analyze your profile against thousands of scheme criteria" },
                { icon: Fingerprint, title: "Biometric Verification", description: "Secure facial recognition ensures your identity is protected" },
                { icon: BarChart3, title: "Real-time Analytics", description: "Track your application status and benefit amounts in real-time" },
                { icon: LightbulbIcon, title: "Smart Recommendations", description: "Get personalized suggestions based on your unique situation" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={`neo-card p-6 cursor-pointer transition-all duration-300 group ${
                    activeTab === i ? "scale-105 shadow-xl border-2 border-primary" : "hover:scale-105 hover:shadow-lg"
                  }`}
                  onClick={() => setActiveTab(i)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`neo-pressed p-4 rounded-xl transition-all duration-300 ${
                      activeTab === i ? "bg-primary scale-110" : "group-hover:scale-110 group-hover:rotate-6"
                    }`}>
                      <item.icon className={`h-6 w-6 ${activeTab === i ? "text-white" : "text-primary"}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Visual Display */}
            <motion.div
              className="neo-flat p-12 rounded-3xl flex items-center justify-center"
              key={activeTab}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="neo-pressed w-80 h-80 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-orange-500/10" />
                {activeTab === 0 && <Brain className="h-32 w-32 text-primary animate-float relative z-10" />}
                {activeTab === 1 && <Fingerprint className="h-32 w-32 text-primary animate-float relative z-10" />}
                {activeTab === 2 && <BarChart3 className="h-32 w-32 text-primary animate-float relative z-10" />}
                {activeTab === 3 && <LightbulbIcon className="h-32 w-32 text-primary animate-float relative z-10" />}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA - Premium Neomorphic Design */}
      <section className="py-32 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="neo-card p-16 text-center relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-10 right-10 neo-pressed w-24 h-24 rounded-full animate-float" />
            <div className="absolute bottom-10 left-10 neo-pressed w-32 h-32 rounded-full animate-float" style={{ animationDelay: "1s" }} />
            
            <div className="relative z-10">
              <motion.div
                className="neo-pressed inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Rocket className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold text-primary">Start Your Journey Today</span>
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-black mb-6 text-foreground">
                Ready to Discover
                <span className="block mt-2 bg-linear-to-r from-primary via-orange-600 to-orange-700 bg-clip-text text-transparent">
                  Your Benefits?
                </span>
              </h2>

              <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
                Join thousands of citizens who have already unlocked lakhs in government benefits. 
                Your welfare schemes are waiting — claim them in just 2 minutes!
              </p>

              <div className="flex flex-wrap gap-6 justify-center">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="neo-btn group px-12 py-8 text-xl font-bold shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                  >
                    <Sparkles className="mr-2 h-6 w-6" />
                    Get Started Free
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="neo-convex px-12 py-8 text-xl font-bold hover:scale-105 transition-all duration-300 border-2 border-primary text-primary hover:bg-primary/10"
                >
                  <MessageSquare className="mr-2 h-6 w-6" />
                  Talk to Support
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>100% free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Neomorphic */}
      <footer className="py-16 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="neo-card p-12 rounded-3xl">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-3 mb-6 group">
                  <div className="neo-pressed flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <span className="text-2xl font-extrabold tracking-tight bg-linear-to-r from-primary to-orange-700 bg-clip-text text-transparent">
                    Citizen Copilot
                  </span>
                </Link>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                  Empowering citizens to discover and claim their rightful government benefits 
                  through cutting-edge AI technology.
                </p>
                <div className="flex gap-4">
                  {[Shield, Heart, Star, Award].map((Icon, i) => (
                    <motion.div
                      key={i}
                      className="neo-pressed p-3 rounded-xl cursor-pointer hover:neo-flat transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
                <ul className="space-y-3">
                  {["Home", "Schemes", "How it Works", "About Us"].map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-bold mb-4 text-lg">Support</h3>
                <ul className="space-y-3">
                  {["Help Center", "Privacy Policy", "Terms of Service", "Contact"].map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="neo-pressed p-6 rounded-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <p>
                  &copy; {new Date().getFullYear()} Citizen Copilot. Built for citizens, by citizens.
                </p>
                <p className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Not affiliated with any government body. Information is for guidance only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
