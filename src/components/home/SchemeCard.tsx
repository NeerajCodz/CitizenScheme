// All Schemes Grid Card Component
"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { tDb } from "@/lib/dbI18n";

interface SchemeCardProps {
  scheme: {
    id?: string;
    slug: string;
    scheme_name: string;
    description: string;
    category: string;
    state: string | null;
    department: string | null;
    official_website: string | null;
  };
  index: number;
}

export function SchemeCard({ scheme, index }: SchemeCardProps) {
  const { t } = useTranslation();
  const schemeId = scheme.id || scheme.slug || scheme.scheme_name;
  const name = tDb(t, "schemes", schemeId, "scheme_name", scheme.scheme_name);
  const description = tDb(
    t,
    "schemes",
    schemeId,
    "description",
    scheme.description || "Government welfare scheme for eligible citizens."
  );
  const category = tDb(t, "schemes", schemeId, "category", scheme.category);
  const state = scheme.state
    ? tDb(t, "schemes", schemeId, "state", scheme.state)
    : null;
  const department = scheme.department
    ? tDb(t, "schemes", schemeId, "department", scheme.department)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: (index % 9) * 0.05, duration: 0.3 }}
    >
      <Link href={`/scheme/${scheme.slug}`}>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
          className="group h-full p-6 neo-elevated hover:neo-elevated-lg rounded-2xl transition-all duration-300 relative overflow-hidden"
        >
          {/* Animated Corner Accent - removed for clean neomorphism */}

          <div className="space-y-4">
            {/* Header with Icon */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-700 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                  {name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                    {category}
                  </Badge>
                  {state && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1 border-slate-300 text-slate-600">
                      <MapPin className="w-3 h-3" />
                      {state}
                    </Badge>
                  )}
                </div>
              </div>
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
              </motion.div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 line-clamp-3">
              {description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              {department && (
                <p className="text-xs text-slate-600 line-clamp-1 flex-1">
                  {department}
                </p>
              )}
              {scheme.official_website && (
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(scheme.official_website!, "_blank", "noopener,noreferrer");
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="neo-inset p-1.5 rounded-md transition-all"
                  aria-label="Visit official website"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Hover Glow Effect - removed for neomorphism */}
        </motion.div>
      </Link>
    </motion.div>
  );
}
