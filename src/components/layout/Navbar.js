"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Sparkles,
  MapPin,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { APP_CONFIG } from "@/lib/constants";
import AnnouncementBar from "./AnnouncementBar";
import MobileNav from "./MobileNav";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

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

  // Navigation links: Home, Men, Women, Kids, Unisex, Collections
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Men", href: "/shop?gender=Men" },
    { label: "Women", href: "/shop?gender=Women" },
    { label: "Kids", href: "/shop?gender=Kids" },
    { label: "Unisex", href: "/shop?gender=Unisex" },
    { label: "Collections", href: "/shop" },
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
      <header className="sticky top-0 z-40 bg-[#F8F6F1]/95 backdrop-blur-md border-b border-[#EBE6DD] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileNavOpen(true)}
                className="p-2 text-[#242424] hover:text-[#666666] transition-colors"
                aria-label="Open mobile navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#242424] hover:text-[#666666] transition-colors ml-1"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Navigation Links (Left) */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-xs font-medium uppercase tracking-[0.16em] transition-colors hover:text-[#242424] ${
                      isActive ? "text-[#242424] font-semibold underline underline-offset-8" : "text-[#666666]"
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
                className="font-serif text-2xl sm:text-3xl tracking-[0.24em] uppercase text-[#242424] font-normal block hover:opacity-85 transition-opacity"
              >
                {APP_CONFIG.name}
              </Link>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Desktop Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#242424] hover:text-[#666666] transition-colors"
                aria-label="Search items"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* User Account / Profile */}
              <div className="relative">
                {session?.user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-[#242424] hover:text-[#666666] border border-transparent hover:border-[#EBE6DD] rounded-sm transition-all"
                      aria-label="User Account"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px] font-medium uppercase tracking-wider text-[#242424]">
                        {session.user.name?.split(" ")?.[0] || "Account"}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <div
                          className="absolute right-0 mt-2 w-56 bg-white border border-[#EBE6DD] shadow-xl py-2 z-50 text-xs tracking-wide animate-fade-in"
                        >
                          <div className="px-4 py-2 border-b border-[#F1EDE5]">
                            <p className="font-semibold text-[#242424] truncate">{session.user.name}</p>
                            <p className="text-[10px] text-neutral-500 truncate">{session.user.email}</p>
                            <span className={`inline-block mt-1 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded ${
                              session.user.role === "ADMIN" 
                                ? "bg-noir-900 text-white" 
                                : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                            }`}>
                              {session.user.role || "CUSTOMER"}
                            </span>
                          </div>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-[#242424] hover:bg-[#F8F6F1] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/addresses"
                          className="flex items-center px-4 py-2 text-[#242424] hover:bg-[#F8F6F1] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <MapPin className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                          <span>Delivery Addresses</span>
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center px-4 py-2 text-[#242424] hover:bg-[#F8F6F1] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                          <span>Order History</span>
                        </Link>
                        {session.user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-[#242424] hover:bg-[#F8F6F1] transition-colors font-medium"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="w-3.5 h-3.5 mr-2 text-brand-600" />
                            <span>Atelier Portal</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5 mr-2" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="p-2 text-[#242424] hover:text-[#666666] transition-colors block"
                    aria-label="Sign in"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                className="p-2 text-[#242424] hover:text-[#666666] transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4" />
                {totalWishlist > 0 && (
                  <span className="absolute top-1 right-1 bg-[#242424] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {totalWishlist}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setCartOpen(true)}
                className="p-2 text-[#242424] hover:text-[#666666] transition-colors relative"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-[#242424] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
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
            placeholder="Search Men, Women, Kids & Unisex garments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
              Popular: Overcoat, Boxy Hoodie, Junior Trench, Silk Shirt, Pleated Trousers
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
