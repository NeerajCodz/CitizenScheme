"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { FeaturedSchemeCard } from "@/components/home/FeaturedSchemeCard";
import { EligibleSchemeCard } from "@/components/home/EligibleSchemeCard";
import { SchemeCard } from "@/components/home/SchemeCard";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

interface Scheme {
  id: string;
  slug: string;
  scheme_name: string;
  description: string;
  benefits: string;
  category: string;
  state: string | null;
  department: string | null;
  official_website: string | null;
  eligibility_score?: number;
}

export default function HomePage() {
  const { t } = useTranslation();
  const [featuredSchemes, setFeaturedSchemes] = useState<Scheme[]>([]);
  const [eligibleSchemes, setEligibleSchemes] = useState<Scheme[]>([]);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    fetchSchemes();
  }, []);

  async function fetchSchemes() {
    try {
      const supabase = createClient();
      const { data: schemes } = await supabase
        .from("schemes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (schemes) {
        // Top 5 featured
        setFeaturedSchemes(schemes.slice(0, 5));
        
        // Simulated eligible schemes (top 6)
        setEligibleSchemes(
          schemes.slice(0, 6).map((s) => ({
            ...s,
            eligibility_score: Math.floor(Math.random() * 15) + 85,
          }))
        );
        
        // All remaining schemes
        setAllSchemes(schemes);
      }
    } catch (error) {
      console.error("Failed to fetch schemes:", error);
    } finally {
      setLoading(false);
    }
  }

  const scrollFeatured = (direction: "left" | "right") => {
    if (featuredScrollRef.current) {
      const scrollAmount = 400;
      featuredScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Component */}
      <Header />

      {/* Hero Section with Parallax */}
      <motion.section
        style={{ opacity, scale }}
        className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto px-4 py-20 sm:py-32">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">{t("hero.badge")}</span>
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                {t("hero.title")}
                <br />
                <span className="bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                  {t("hero.subtitle")}
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
                {t("hero.description")}
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-8"
                  onClick={() =>
                    document
                      .getElementById("featured")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {t("hero.cta")}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z"
              fill="hsl(38 25% 95%)"
            />
          </svg>
        </div>
      </motion.section>

      {/* Featured Schemes - Horizontal Scroll */}
      <section id="featured" className="py-16 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-linear-to-b from-primary to-accent rounded-full" />
                <h2 className="text-3xl font-bold text-foreground">
                  {t("featured.title")}
                </h2>
              </div>
              <p className="text-muted-foreground ml-7">
                {t("featured.subtitle")}
              </p>
            </div>

            <div className="hidden sm:flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollFeatured("left")}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollFeatured("right")}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          <div
            ref={featuredScrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featuredSchemes.map((scheme, index) => (
              <FeaturedSchemeCard
                key={scheme.id}
                scheme={scheme}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Eligible Schemes */}
      <section className="py-16 bg-linear-to-b from-orange-50/30 to-transparent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
              <h2 className="text-3xl font-bold text-foreground">
                {t("eligible.title")}
              </h2>
            </div>
            <p className="text-muted-foreground ml-7">
              {t("eligible.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleSchemes.map((scheme, index) => (
              <EligibleSchemeCard
                key={scheme.id}
                scheme={scheme}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All Schemes Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
              <h2 className="text-3xl font-bold text-foreground">
                {t("all.title")}
              </h2>
            </div>
            <p className="text-muted-foreground ml-7">
              {t("all.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSchemes.map((scheme, index) => (
              <SchemeCard key={scheme.id} scheme={scheme} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />

      {/* Chatbot Button */}
      <ChatbotButton />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
