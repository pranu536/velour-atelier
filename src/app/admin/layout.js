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
  Layers,
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
            className="flex items-center text-xs uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors"
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
