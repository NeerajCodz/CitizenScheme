"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { calculateEligibility } from "@/lib/recommendation";
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
  eligibility_rules?: any;
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
      
      // Get user profile for eligibility calculation
      const { data: { user } } = await supabase.auth.getUser();
      let userProfile = null;
      
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        userProfile = profile;
      }

      const { data: schemes } = await supabase
        .from("schemes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (schemes) {
        // Top 5 featured
        setFeaturedSchemes(schemes.slice(0, 5));
        
        // Calculate real eligibility scores for user
        if (userProfile) {
          const schemesWithScores = schemes.map((scheme: Scheme) => {
            const eligibility = calculateEligibility(userProfile, scheme.eligibility_rules || {});
            return {
              ...scheme,
              eligibility_score: eligibility.score,
            };
          });
          
          // Sort by score and take top 6
          const topEligible = schemesWithScores
            .sort((a: Scheme, b: Scheme) => (b.eligibility_score || 0) - (a.eligibility_score || 0))
            .slice(0, 6);
          
          setEligibleSchemes(topEligible);
        } else {
          // Guest user - show random schemes
          setEligibleSchemes(
            schemes.slice(0, 6).map((s: Scheme) => ({
              ...s,
              eligibility_score: Math.floor(Math.random() * 15) + 75,
            }))
          );
        }
        
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb]">
      {/* Header Component */}
      <Header />

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
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full" />
                <h2 className="text-3xl font-bold text-slate-700">
                  {t("featured.title")}
                </h2>
              </div>
              <p className="text-slate-600 ml-7">
                {t("featured.subtitle")}
              </p>
            </div>

            <div className="hidden sm:flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollFeatured("left")}
                className="neo-elevated rounded-full border-0 hover:neo-elevated-sm"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollFeatured("right")}
                className="neo-elevated rounded-full border-0 hover:neo-elevated-sm"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
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
      <section className="py-16 bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full" />
              <h2 className="text-3xl font-bold text-slate-700">
                {t("eligible.title")}
              </h2>
            </div>
            <p className="text-slate-600 ml-7">
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
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full" />
              <h2 className="text-3xl font-bold text-slate-700">
                {t("all.title")}
              </h2>
            </div>
            <p className="text-slate-600 ml-7">
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
