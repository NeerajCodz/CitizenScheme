// Featured Scheme Card Component with horizontal scroll
"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FeaturedSchemeCardProps {
  scheme: {
    id: string;
    slug: string;
    scheme_name: string;
    description: string;
    benefits: string;
    category: string;
    state: string | null;
    official_website: string | null;
  };
  index: number;
}

export function FeaturedSchemeCard({
  scheme,
  index,
}: FeaturedSchemeCardProps) {
  // Use gradient background instead of external logo service
  const gradients = [
    "from-orange-400 to-orange-600",
    "from-amber-400 to-orange-500",
    "from-yellow-400 to-orange-400",
    "from-red-400 to-orange-500",
    "from-orange-500 to-red-500",
  ];
  const gradientClass = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="shrink-0 w-85 sm:w-95"
    >
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3 }}
        className="group relative h-full overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-300 neo-flat hover:neo-convex rounded-2xl"
      >
        <motion.div className="relative h-full">
          {/* Image Section */}
          <div className={`relative h-48 overflow-hidden bg-linear-to-br ${gradientClass}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/90 text-6xl font-bold">
                {scheme.scheme_name.charAt(0)}
              </div>
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                {scheme.category}
              </Badge>
            </div>

            {/* State Badge */}
            {scheme.state && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm neo-flat border-0">
                  {scheme.state}
                </Badge>
              </div>
            )}

            {/* Featured Ribbon */}
            <div className="absolute top-8 -right-10 bg-gradient-to-r from-green-500 to-green-600 text-white px-12 py-1 rotate-45 text-xs font-bold shadow-lg">
              FEATURED
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                {scheme.scheme_name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {scheme.description || "Discover the benefits of this government welfare scheme."}
              </p>
            </div>

            {/* Benefits Preview */}
            {scheme.benefits && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  <span className="font-semibold text-primary">Benefits:</span>{" "}
                  {scheme.benefits}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Link href={`/scheme/${scheme.slug}`} className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              
              {scheme.official_website && (
                <motion.a
                  href={scheme.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 border-2 border-primary/20 hover:border-primary/40 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                </motion.a>
              )}
            </div>
          </div>

          {/* Hover Glow Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.8 }}
            className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-2xl blur-lg -z-10"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
