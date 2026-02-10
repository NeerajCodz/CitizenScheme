// Eligible Scheme Card Component
"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, ArrowRight, Building2, Users } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { tDb } from "@/lib/dbI18n";

interface EligibleSchemeCardProps {
  scheme: {
    id?: string;
    slug: string;
    scheme_name: string;
    description: string;
    category: string;
    benefits: string;
    eligibility_score?: number;
    scheme_type?: "government" | "private";
  };
  index: number;
}

export function EligibleSchemeCard({
  scheme,
  index,
}: EligibleSchemeCardProps) {
  const { t } = useTranslation();
  const schemeId = scheme.id || scheme.slug || scheme.scheme_name;
  const name = tDb(t, "schemes", schemeId, "scheme_name", scheme.scheme_name);
  const description = tDb(t, "schemes", schemeId, "description", scheme.description);
  const benefits = scheme.benefits
    ? tDb(t, "schemes", schemeId, "benefits", scheme.benefits)
    : "";
  const category = tDb(t, "schemes", schemeId, "category", scheme.category);
  const score = scheme.eligibility_score || 85;
  const isPrivate = scheme.scheme_type === "private";
  const scoreGradient = isPrivate ? "from-emerald-500 to-emerald-600" : "from-orange-500 to-orange-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={`/scheme/${scheme.slug}`}>
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="group relative h-full p-6 neo-elevated-lg hover:neo-elevated-xl rounded-2xl transition-all duration-300 overflow-hidden"
        >
          {/* Match Score Indicator */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className={`bg-linear-to-br ${scoreGradient} text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1`}>
                <TrendingUp className="w-3 h-3" />
                {score}% {t("common.match")}
              </div>
            </motion.div>
            <Badge className={`text-[10px] ${isPrivate ? "bg-emerald-600 text-white border-emerald-600" : "bg-orange-500 text-white border-orange-500"}`}>
              {isPrivate ? <><Users className="mr-1 h-2.5 w-2.5" />Org</> : <><Building2 className="mr-1 h-2.5 w-2.5" />Govt</>}
            </Badge>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className="mt-1"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-700 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-1">
                  {name}
                </h3>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {category}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 line-clamp-3">
              {description}
            </p>

            {/* Benefits */}
            {benefits && (
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-600 line-clamp-2">
                  <span className="font-semibold text-emerald-600">{t("common.keyBenefit")}:</span>{" "}
                  {benefits.split(".")[0]}
                </p>
              </div>
            )}

            {/* Action */}
            <motion.div
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-emerald-600 font-medium text-sm pt-2"
            >
              {t("common.applyNow")}
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Glow Effect removed for neomorphism */}
        </motion.div>
      </Link>
    </motion.div>
  );
}
