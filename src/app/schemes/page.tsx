"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, TrendingUp, Building2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateEligibility } from "@/lib/recommendation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatbotButton } from "@/components/ChatbotButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { tDb } from "@/lib/dbI18n";
import Link from "next/link";

interface Scheme {
  id: string;
  slug: string;
  scheme_name: string;
  description: string;
  category: string;
  state: string | null;
  department: string | null;
  scheme_type: 'government' | 'private';
  official_website: string | null;
  eligibility_score?: number;
}

export default function SchemesPage() {
  const { t, i18n } = useTranslation();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [categorySamples, setCategorySamples] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [searchQuery, selectedCategory, selectedType, schemes, i18n.language]);

  async function fetchSchemes() {
    try {
      const supabase = createClient();
      
      // Get user profile for eligibility
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

      const { data } = await supabase
        .from("schemes")
        .select("*")
        .eq("is_active", true)
        .order("scheme_name");

      if (data) {
        // Calculate eligibility scores
        const schemesWithScores = data.map((scheme) => {
          if (userProfile) {
            const eligibility = calculateEligibility(
              userProfile,
              scheme.eligibility_rules || {}
            );
            return { ...scheme, eligibility_score: eligibility.score };
          }
          return scheme;
        });

        setSchemes(schemesWithScores);
        setFilteredSchemes(schemesWithScores);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((s) => s.category).filter(Boolean))
        );
        setCategories(uniqueCategories);

        const sampleMap: Record<string, string> = {};
        data.forEach((s) => {
          if (s.category && !sampleMap[s.category]) {
            sampleMap[s.category] = s.id;
          }
        });
        setCategorySamples(sampleMap);
      }
    } catch (error) {
      console.error("Failed to fetch schemes:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterSchemes() {
    let filtered = schemes;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((scheme) => {
        const name = tDb(t, "schemes", scheme.id, "scheme_name", scheme.scheme_name);
        const description = tDb(t, "schemes", scheme.id, "description", scheme.description || "");
        const category = tDb(t, "schemes", scheme.id, "category", scheme.category || "");
        const department = tDb(t, "schemes", scheme.id, "department", scheme.department || "");

        return (
          name.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query) ||
          department.toLowerCase().includes(query)
        );
      });
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((scheme) => scheme.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((scheme) => scheme.scheme_type === selectedType);
    }

    setFilteredSchemes(filtered);
  }

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
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
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("schemes.title") || "All Schemes"}
            </h1>
            <p className="text-lg text-white/90">
              {t("schemes.subtitle") ||
                "Browse through all available government and private welfare schemes"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="sticky top-20 z-40 bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] border-b border-black/5 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-600 group-focus-within:rotate-12 transition-all duration-300" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("schemes.search") || "Search schemes..."}
                className="pl-10 neo-inset rounded-xl border-0 text-slate-700 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-xl neo-elevated text-slate-700 border-0 focus:neo-inset transition-all cursor-pointer hover:scale-105 hover:neo-elevated-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categorySamples[cat]
                    ? tDb(t, "schemes", categorySamples[cat], "category", cat)
                    : cat}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 rounded-xl neo-elevated text-slate-700 border-0 focus:neo-inset transition-all cursor-pointer hover:scale-105 hover:neo-elevated-sm"
            >
              <option value="all">All Types</option>
              <option value="government">Government</option>
              <option value="private">Private</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory !== "all" || selectedType !== "all") && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  className="rounded-xl neo-elevated hover:neo-inset hover:scale-110 transition-all duration-300 group"
                >
                  <X className="h-5 w-5 text-slate-700 group-hover:rotate-90 transition-transform duration-300" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
            <Filter className="h-4 w-4" />
            <span>
              Showing {filteredSchemes.length} of {schemes.length} schemes
            </span>
          </div>
        </div>
      </section>

      {/* Schemes Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {filteredSchemes.length > 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredSchemes.map((scheme, index) => (
                  <motion.div
                    key={scheme.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/scheme/${scheme.slug}`}>
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={`h-full p-6 neo-elevated-lg hover:neo-elevated-xl rounded-2xl transition-all relative overflow-hidden group ${
                          scheme.scheme_type === 'government'
                            ? 'neo-govt'
                            : 'neo-private'
                        }`}
                      >
                        {/* Type Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge
                            className={`${
                              scheme.scheme_type === 'government'
                                ? 'bg-orange-500 text-white'
                                : 'bg-emerald-600 text-white'
                            } neo-inset border-0 group-hover:scale-110 transition-transform duration-300`}
                          >
                            {scheme.scheme_type === 'government' ? (
                              <Building2 className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform duration-300" />
                            ) : (
                              <Users className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform duration-300" />
                            )}
                            {scheme.scheme_type === 'government' ? 'Govt' : 'Private'}
                          </Badge>
                        </div>

                        {/* Eligibility Score */}
                        {scheme.eligibility_score !== undefined && (
                          <div className="absolute top-4 left-4">
                            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold group-hover:scale-110 transition-transform duration-300">
                              <TrendingUp className="h-3 w-3 group-hover:rotate-12 transition-transform duration-300" />
                              {scheme.eligibility_score}%
                            </div>
                          </div>
                        )}

                        <div className="mt-8 space-y-4">
                          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-foreground transition-colors line-clamp-2 group-hover:translate-x-1 duration-300">
                            {tDb(t, "schemes", scheme.id, "scheme_name", scheme.scheme_name)}
                          </h3>

                          <p className="text-sm text-slate-600 line-clamp-3 group-hover:text-slate-700 transition-colors duration-300">
                            {tDb(
                              t,
                              "schemes",
                              scheme.id,
                              "description",
                              scheme.description || "Government welfare scheme for eligible citizens."
                            )}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 group-hover:scale-105 transition-transform duration-300">
                              {tDb(t, "schemes", scheme.id, "category", scheme.category)}
                            </Badge>
                            {scheme.state && (
                              <Badge variant="outline" className="text-xs border-slate-300 text-slate-600 group-hover:scale-105 transition-transform duration-300">
                                {tDb(t, "schemes", scheme.id, "state", scheme.state)}
                              </Badge>
                            )}
                          </div>

                          {scheme.department && (
                            <p className="text-xs text-slate-600 line-clamp-1 pt-2 border-t border-slate-200 group-hover:text-slate-700 transition-colors duration-300">
                              {tDb(t, "schemes", scheme.id, "department", scheme.department)}
                            </p>
                          )}
                        </div>

                        {/* Hover Glow - removed for neomorphism */}
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="neo-elevated-lg rounded-2xl p-12 max-w-md mx-auto">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Filter className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2 text-slate-700">No schemes found</h3>
                  <p className="text-slate-600 mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={clearFilters} className="neo-btn-primary rounded-xl hover:scale-105 transition-all duration-300">
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
      <ChatbotButton />
    </div>
  );
}
