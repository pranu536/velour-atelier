"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Shield,
  Loader2,
  UserCheck,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import Button from "@/components/common/Button";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Garments & Stock", href: "/admin/products", icon: Package },
    { label: "Fulfillment Orders", href: "/admin/orders", icon: ShoppingBag },
  ];

  // 1. Loading state during session handshake
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center space-y-3 text-white">
        <Loader2 className="w-7 h-7 animate-spin text-brand-400" />
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
          Verifying Atelier Clearance...
        </span>
      </div>
    );
  }

  // 2. Defense-in-depth authorization guard:
  // Strictly prevent non-ADMIN users or unauthenticated visitors from accessing administrative portal
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#EBE6DD] p-8 sm:p-10 text-center space-y-5 shadow-sm rounded-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest text-rose-600 font-semibold block">
              Restricted Portal
            </span>
            <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#242424]">
              Administrator Clearance Required
            </h1>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {session?.user
                ? `Signed in as ${session.user.email} (Role: ${session.user.role}). This account does not possess administrative privileges.`
                : "Authentication required. Please sign in with an administrator account to access atelier operations."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/" variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Return to Storefront</span>
            </Button>
            <Button
              href="/login?callbackUrl=/admin"
              variant="primary"
              size="sm"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              <span>{session?.user ? "Switch Account" : "Admin Sign In"}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Administrator View
  return (
    <div className="min-h-screen bg-neutral-100/70 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-noir-900 text-white flex-shrink-0 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo & Portal title */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold tracking-widest text-white">
                {APP_CONFIG.name}
              </span>
              <span className="px-1.5 py-0.5 bg-brand-500 text-white text-[9px] font-semibold uppercase tracking-wider rounded">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
              Atelier Management Suite
            </p>
          </div>

          {/* Active Administrator Identity Badge */}
          <div className="p-3 bg-neutral-800/80 border border-neutral-700/60 rounded-sm space-y-1">
            <div className="flex items-center space-x-2 text-[10px] text-brand-400 uppercase tracking-wider font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Authenticated Admin</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">
              {session.user.name || "Administrator"}
            </p>
            <p className="text-[10px] text-neutral-400 truncate">
              {session.user.email}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3.5 py-2.5 rounded-sm text-xs uppercase tracking-wider font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-800 text-white border-l-2 border-brand-400 font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="pt-6 border-t border-neutral-800 space-y-3">
          <Link
            href="/"
            className="flex items-center text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            <span>Return to Storefront</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center text-xs uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors w-full text-left"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
