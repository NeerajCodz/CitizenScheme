// All Schemes Grid Card Component
"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SchemeCardProps {
  scheme: {
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
          className="group h-full p-6 neo-flat hover:neo-convex rounded-2xl transition-all duration-300 relative overflow-hidden"
        >
          {/* Animated Corner Accent */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-primary/20 to-transparent rounded-bl-full -z-10"
          />

          <div className="space-y-4">
            {/* Header with Icon */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {scheme.scheme_name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {scheme.category}
                  </Badge>
                  {scheme.state && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {scheme.state}
                    </Badge>
                  )}
                </div>
              </div>
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileText className="w-5 h-5 text-primary/60 shrink-0" />
              </motion.div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-3">
              {scheme.description || "Government welfare scheme for eligible citizens."}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              {scheme.department && (
                <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
                  {scheme.department}
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
                  className="p-1.5 hover:bg-primary/10 rounded-md transition-colors"
                  aria-label="Visit official website"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Hover Glow Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-green-500 rounded-2xl blur-sm -z-20"
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
