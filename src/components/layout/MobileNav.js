"use client";

import Link from "next/link";
import { X, User, Heart, ShoppingBag, Shield, LogOut, Package, Sparkles, MapPin } from "lucide-react";
import { signOut } from "next-auth/react";
import { APP_CONFIG } from "@/lib/constants";

export default function MobileNav({ isOpen, onClose, links, session }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#F8F6F1] shadow-2xl flex flex-col z-10 animate-fade-in border-r border-[#EBE6DD]">
        {/* Header */}
        <div className="p-5 border-b border-[#EBE6DD] flex items-center justify-between bg-white">
          <span className="font-serif text-xl tracking-[0.2em] uppercase text-[#242424]">
            {APP_CONFIG.name}
          </span>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-[#242424]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Main Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest text-[#7F6650] font-semibold">
              Navigation
            </h4>
            <div className="space-y-2">
              <Link
                href="/"
                onClick={onClose}
                className="block text-sm uppercase tracking-wider text-[#242424] font-medium hover:text-[#7F6650]"
              >
                Home
              </Link>
              <Link
                href="/shop?gender=Men"
                onClick={onClose}
                className="block text-sm uppercase tracking-wider text-[#242424] font-medium hover:text-[#7F6650]"
              >
                Men
              </Link>
              <Link
                href="/shop?gender=Women"
                onClick={onClose}
                className="block text-sm uppercase tracking-wider text-[#242424] font-medium hover:text-[#7F6650]"
              >
                Women
              </Link>
              <Link
                href="/shop?gender=Kids"
                onClick={onClose}
                className="block text-sm uppercase tracking-wider text-[#242424] font-medium hover:text-[#7F6650]"
              >
                Kids
              </Link>
              <Link
                href="/shop?gender=Unisex"
                onClick={onClose}
                className="block text-sm uppercase tracking-wider text-[#242424] font-medium hover:text-[#7F6650]"
              >
                Unisex
              </Link>
              <Link
                href="/shop"
                onClick={onClose}
                className="block text-sm uppercase tracking-wider text-[#242424] font-medium hover:text-[#7F6650]"
              >
                Collections
              </Link>
            </div>
          </div>

          {/* Quick Audience 2x2 Grid */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              Shop By Line
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/shop?gender=Women"
                onClick={onClose}
                className="p-3 bg-white hover:bg-[#F1EDE5] border border-[#EBE6DD] text-center text-xs uppercase tracking-wider font-medium text-[#242424]"
              >
                Women
              </Link>
              <Link
                href="/shop?gender=Men"
                onClick={onClose}
                className="p-3 bg-white hover:bg-[#F1EDE5] border border-[#EBE6DD] text-center text-xs uppercase tracking-wider font-medium text-[#242424]"
              >
                Men
              </Link>
              <Link
                href="/shop?gender=Kids"
                onClick={onClose}
                className="p-3 bg-white hover:bg-[#F1EDE5] border border-[#EBE6DD] text-center text-xs uppercase tracking-wider font-medium text-[#242424]"
              >
                Kids
              </Link>
              <Link
                href="/shop?gender=Unisex"
                onClick={onClose}
                className="p-3 bg-white hover:bg-[#F1EDE5] border border-[#EBE6DD] text-center text-xs uppercase tracking-wider font-medium text-[#242424]"
              >
                Unisex
              </Link>
            </div>
          </div>

          {/* Catalog Categories */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              Explore Collections
            </h4>
            <div className="space-y-2.5">
              <Link
                href="/shop?sort=newest"
                onClick={onClose}
                className="block text-xs uppercase tracking-wider text-noir-900 font-medium hover:text-brand-600"
              >
                New Arrivals
              </Link>
              <Link
                href="/shop?sort=trending"
                onClick={onClose}
                className="block text-xs uppercase tracking-wider text-noir-900 font-medium hover:text-brand-600"
              >
                Trending Essentials
              </Link>
              <Link
                href="/shop"
                onClick={onClose}
                className="block text-xs uppercase tracking-wider text-noir-900 font-medium hover:text-brand-600"
              >
                All Garments
              </Link>
              <Link
                href="/shop?category=outerwear-coats"
                onClick={onClose}
                className="block text-xs uppercase tracking-wider text-neutral-600 hover:text-noir-900"
              >
                Outerwear & Coats
              </Link>
              <Link
                href="/shop?category=hoodies-sweats"
                onClick={onClose}
                className="block text-xs uppercase tracking-wider text-neutral-600 hover:text-noir-900"
              >
                Hoodies & Sweats
              </Link>
              <Link
                href="/shop?category=tailored-trousers"
                onClick={onClose}
                className="block text-xs uppercase tracking-wider text-neutral-600 hover:text-noir-900"
              >
                Tailored Trousers
              </Link>
              <Link
                href="/shop?category=knitwear-sweaters"
                onClick={onClose}
                className="block text-xs uppercase tracking-wider text-neutral-600 hover:text-noir-900"
              >
                Knitwear
              </Link>
            </div>
          </div>

          {/* Account & Saved */}
          <div className="border-t border-neutral-100 pt-5 space-y-3">
            <h4 className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              Account & Saved
            </h4>
            {session?.user ? (
              <div className="space-y-3">
                <div className="pb-1">
                  <p className="text-xs font-semibold text-noir-900">{session.user.name}</p>
                  <p className="text-[11px] text-neutral-400">{session.user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center text-xs uppercase tracking-wider text-neutral-700 hover:text-noir-900"
                >
                  <User className="w-4 h-4 mr-3 text-neutral-400" />
                  My Profile
                </Link>
                <Link
                  href="/addresses"
                  onClick={onClose}
                  className="flex items-center text-xs uppercase tracking-wider text-neutral-700 hover:text-noir-900"
                >
                  <MapPin className="w-4 h-4 mr-3 text-neutral-400" />
                  Delivery Addresses
                </Link>
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="flex items-center text-xs uppercase tracking-wider text-neutral-700 hover:text-noir-900"
                >
                  <Package className="w-4 h-4 mr-3 text-neutral-400" />
                  Order History & Tracker
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center text-xs uppercase tracking-wider text-brand-700 font-semibold"
                  >
                    <Shield className="w-4 h-4 mr-3 text-brand-600" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    onClose();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center text-xs uppercase tracking-wider text-rose-600 pt-2"
                >
                  <LogOut className="w-4 h-4 mr-3 text-rose-500" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block w-full py-2.5 text-center text-xs uppercase tracking-wider font-semibold bg-noir-900 text-white rounded-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="block w-full py-2.5 text-center text-xs uppercase tracking-wider font-semibold border border-neutral-300 text-neutral-800 rounded-sm"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-5 border-t border-neutral-100 bg-neutral-50 text-[11px] text-neutral-400 text-center">
          Complimentary Courier Shipping on orders over ₹2,499
        </div>
      </div>
    </div>
  );
}
