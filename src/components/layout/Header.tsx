"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, Menu, X, Home, FileText, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const NotificationBellClient = dynamic(
  () => import("@/components/notifications/NotificationBellClient").then(mod => ({ default: mod.NotificationBellClient })),
  { ssr: false, loading: () => <div className="w-10 h-10" /> }
);

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navLinks = [
    { href: "/home", label: t("nav.home") || "Home", icon: Home },
    { href: "/schemes", label: t("nav.schemes") || "Schemes", icon: FileText },
    { href: "/help", label: t("nav.help") || "Help", icon: HelpCircle },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "neo-flat shadow-lg"
            : "bg-background/80 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <Link href="/home" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="relative h-12 w-12 rounded-2xl neo-convex flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 opacity-90" />
                <Sparkles className="h-6 w-6 text-white relative z-10" />
              </motion.div>
              <div className="hidden sm:block">
                <motion.h1
                  className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  CitizenSchemes
                </motion.h1>
                <p className="text-xs text-muted-foreground -mt-1">
                  {t("header.tagline") || "Empowering Citizens"}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        className={`gap-2 rounded-xl transition-all ${
                          isActive
                            ? "neo-pressed text-primary font-semibold"
                            : "hover:neo-flat"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Button>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <LanguageSwitcher />
              </motion.div>

              {user && (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <NotificationBellClient />
                  </motion.div>

                  <Link href="/profile">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full neo-flat h-11 w-11 hover:neo-pressed transition-all"
                      >
                        <User className="h-5 w-5 text-primary" />
                      </Button>
                    </motion.div>
                  </Link>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden lg:block"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="gap-2 rounded-xl hover:neo-flat hover:text-destructive transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("common.logout") || "Logout"}
                    </Button>
                  </motion.div>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl neo-flat"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t neo-pressed"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 rounded-xl ${
                            isActive ? "neo-pressed text-primary font-semibold" : "hover:neo-flat"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Button>
                      </motion.div>
                    </Link>
                  );
                })}
                {user && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start gap-3 rounded-xl hover:neo-flat hover:text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      {t("common.logout") || "Logout"}
                    </Button>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-20" />
    </>
  );
}
