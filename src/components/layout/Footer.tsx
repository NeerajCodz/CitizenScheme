"use client";

import { motion } from "framer-motion";
import { Sparkles, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { href: "/home", label: t("footer.home") || "Home" },
      { href: "/schemes", label: t("footer.allSchemes") || "All Schemes" },
      { href: "/profile", label: t("footer.myProfile") || "My Profile" },
      { href: "/applications", label: t("footer.myApplications") || "My Applications" },
    ],
    categories: [
      { href: "/schemes?category=education", label: t("footer.education") || "Education" },
      { href: "/schemes?category=health", label: t("footer.health") || "Health" },
      { href: "/schemes?category=agriculture", label: t("footer.agriculture") || "Agriculture" },
      { href: "/schemes?category=women", label: t("footer.women") || "Women Welfare" },
    ],
    support: [
      { href: "/help", label: t("footer.help") || "Help Center" },
      { href: "/faq", label: t("footer.faq") || "FAQ" },
      { href: "/contact", label: t("footer.contact") || "Contact Us" },
      { href: "/privacy", label: t("footer.privacy") || "Privacy Policy" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-sky-500" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-700" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-600" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <footer className="relative bg-gradient-to-br from-orange-50 via-background to-green-50 border-t mt-20">
      {/* Wave Divider */}
      <div className="absolute top-0 left-0 right-0 -translate-y-full">
        <svg
          viewBox="0 0 1440 120"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L0,0Z"
            className="fill-orange-50"
          />
        </svg>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-4 pt-16 pb-8"
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Link href="/home" className="flex items-center gap-3 mb-4 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="h-12 w-12 rounded-2xl neo-convex flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 opacity-90" />
                <Sparkles className="h-6 w-6 text-white relative z-10" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  CitizenSchemes
                </h3>
                <p className="text-xs text-muted-foreground -mt-1">
                  {t("footer.tagline") || "Empowering Citizens Nationwide"}
                </p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {t("footer.description") ||
                "Connect with government welfare programs tailored to your profile. Simplified access, verified eligibility, seamless applications."}
            </p>
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@citizenschemes.gov.in">support@citizenschemes.gov.in</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                <a href="tel:1800-111-0000">1800-111-0000</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>New Delhi, India</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="h-5 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
              {t("footer.quickLinks") || "Quick Links"}
            </h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="h-5 w-1 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
              {t("footer.categories") || "Categories"}
            </h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-success hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="h-5 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
              {t("footer.support") || "Support"}
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          {/* Copyright */}
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear}{" "}
            <span className="font-semibold text-primary">CitizenSchemes</span>.{" "}
            {t("footer.rights") || "All rights reserved."}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`h-10 w-10 rounded-xl neo-flat flex items-center justify-center text-muted-foreground ${social.color} transition-colors group`}
                  aria-label={social.label}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              );
            })}
          </div>

          {/* Government Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl neo-flat"
          >
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 rounded-full bg-orange-500" />
              <div className="h-4 w-4 rounded-full bg-white border border-border" />
              <div className="h-4 w-4 rounded-full bg-green-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {t("footer.govtIndia") || "Government of India"}
            </span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
