"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  Shield,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { APP_CONFIG } from "@/lib/constants";
import AnnouncementBar from "./AnnouncementBar";
import MobileNav from "./MobileNav";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { totalWishlist } = useWishlist();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { label: "New In", href: "/shop?sort=newest" },
    { label: "Collections", href: "/shop" },
    { label: "Women", href: "/shop?gender=Women" },
    { label: "Men", href: "/shop?gender=Men" },
    { label: "Outerwear", href: "/shop?category=outerwear-coats" },
    { label: "Knitwear", href: "/shop?category=knitwear-sweaters" },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-shadow duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="p-2 text-noir-900 hover:text-brand-600 transition-colors"
                aria-label="Open mobile navigation"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-noir-900 hover:text-brand-600 transition-colors ml-1"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Navigation Links (Left) */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-xs font-medium uppercase tracking-widest transition-colors hover:text-brand-600 ${
                      isActive ? "text-noir-900 font-semibold" : "text-neutral-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Brand Logo (Center) */}
            <div className="flex-shrink-0 text-center">
              <Link
                href="/"
                className="font-serif text-2xl sm:text-3xl tracking-widest uppercase text-noir-900 font-bold block hover:opacity-90 transition-opacity"
              >
                {APP_CONFIG.name}
              </Link>
              <span className="text-[9px] tracking-ultra text-neutral-400 uppercase hidden sm:block -mt-1 font-sans">
                Atelier
              </span>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Desktop Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center text-xs text-neutral-600 hover:text-noir-900 p-2 space-x-2 transition-colors uppercase tracking-wider"
                aria-label="Search items"
              >
                <Search className="w-4 h-4 text-noir-900" />
                <span className="hidden xl:inline text-[11px]">Search</span>
              </button>

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                className="p-2 text-neutral-800 hover:text-rose-600 transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {totalWishlist > 0 && (
                  <span className="absolute top-1 right-1 bg-noir-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalWishlist}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 text-neutral-800 hover:text-noir-900 transition-colors relative"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-noir-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Account Dropdown */}
              <div className="relative">
                {session?.user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-1.5 p-2 text-neutral-800 hover:text-noir-900 transition-colors"
                      aria-label="User Account"
                    >
                      <User className="w-5 h-5" />
                      <span className="hidden xl:inline text-xs font-medium max-w-[100px] truncate">
                        {session.user.name?.split(" ")[0]}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 bg-white border border-neutral-100 shadow-xl rounded-sm py-2 z-50 text-xs tracking-wide animate-fade-in"
                        onMouseLeave={() => setIsUserMenuOpen(false)}
                      >
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="font-semibold text-noir-900 truncate">{session.user.name}</p>
                          <p className="text-[10px] text-neutral-500 truncate">{session.user.email}</p>
                          {session.user.role === "ADMIN" && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-neutral-900 text-white text-[9px] font-semibold rounded uppercase tracking-wider">
                              Admin
                            </span>
                          )}
                        </div>

                        <Link
                          href="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-noir-900"
                        >
                          <User className="w-3.5 h-3.5 mr-2.5 text-neutral-400" />
                          My Profile & Addresses
                        </Link>

                        <Link
                          href="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-noir-900"
                        >
                          <Package className="w-3.5 h-3.5 mr-2.5 text-neutral-400" />
                          My Orders & Tracking
                        </Link>

                        {session.user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-brand-700 font-semibold bg-brand-50/50 hover:bg-brand-50"
                          >
                            <Shield className="w-3.5 h-3.5 mr-2.5 text-brand-600" />
                            Admin Dashboard
                          </Link>
                        )}

                        <div className="border-t border-neutral-100 my-1"></div>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-3.5 h-3.5 mr-2.5 text-rose-500" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="p-2 text-neutral-800 hover:text-noir-900 transition-colors flex items-center"
                    aria-label="Sign In"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden xl:inline ml-1 text-xs uppercase tracking-wider">
                      Sign In
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        links={navLinks}
        session={session}
      />

      {/* Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Search Atelier Collections"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <Input
            placeholder="Search tailored overcoats, boxy hoodies, silk shirts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
              Popular: Overcoat, Pleated, Cashmere, Heavyweight
            </span>
            <Button type="submit" variant="primary" size="sm">
              Search
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
