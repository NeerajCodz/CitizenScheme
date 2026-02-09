// Eligible Scheme Card Component
"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EligibleSchemeCardProps {
  scheme: {
    slug: string;
    scheme_name: string;
    description: string;
    category: string;
    benefits: string;
    eligibility_score?: number;
  };
  index: number;
}

export function EligibleSchemeCard({
  scheme,
  index,
}: EligibleSchemeCardProps) {
  const score = scheme.eligibility_score || 85;

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
          className="group relative h-full p-6 neo-flat hover:neo-convex rounded-2xl border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 overflow-hidden"
        >
          {/* Match Score Indicator */}
          <div className="absolute top-4 right-4">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="bg-linear-to-br from-green-500 to-green-600 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {score}% Match
              </div>
            </motion.div>
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
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {scheme.scheme_name}
                </h3>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {scheme.category}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-3">
              {scheme.description}
            </p>

            {/* Benefits */}
            {scheme.benefits && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  <span className="font-semibold text-primary">Key Benefit:</span>{" "}
                  {scheme.benefits.split('.')[0]}
                </p>
              </div>
            )}

            {/* Action */}
            <motion.div
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-primary font-medium text-sm pt-2"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Glow Effect on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.6 }}
            className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-orange-500/20 rounded-2xl blur-xl -z-10"
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
