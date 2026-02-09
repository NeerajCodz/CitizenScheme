"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  ArrowLeft,
  Building2,
  Bell,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/schemes", label: "Schemes", icon: FileText },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-border/50 bg-card md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border/50 px-4">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/50 p-3 space-y-1">
          <Link href="/home">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border/50 px-4 md:hidden">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold">Admin</span>
          <div className="ml-auto flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm">
                  <item.icon className="h-4 w-4" />
                </Button>
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
