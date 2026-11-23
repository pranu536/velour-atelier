import Link from "next/link";
import { APP_CONFIG } from "@/lib/constants";
import { Mail, ArrowRight, ShieldCheck, RefreshCw, Truck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-noir-900 text-white border-t border-neutral-800">
      {/* Brand Value Pillars */}
      <div className="border-b border-neutral-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4">
            <div className="p-3 bg-neutral-800 rounded-full text-brand-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold">Complimentary Express Shipping</h4>
              <p className="text-xs text-neutral-400 mt-1">Dispatched within 24 hours on all orders over ₹2,499.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4">
            <div className="p-3 bg-neutral-800 rounded-full text-brand-300">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold">Effortless 14-Day Exchanges</h4>
              <p className="text-xs text-neutral-400 mt-1">Hassle-free return pickups arranged from your doorstep.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4">
            <div className="p-3 bg-neutral-800 rounded-full text-brand-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold">Secure Payment Protection</h4>
              <p className="text-xs text-neutral-400 mt-1">Encrypted checkout powered by Razorpay and 256-bit SSL.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block text-2xl font-serif tracking-widest text-white">
            {APP_CONFIG.name}
          </Link>
          <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
            {APP_CONFIG.tagline}. Architectural silhouettes, tailored cuts, and organic textiles crafted for timeless personal style.
          </p>
          {/* Newsletter Box */}
          <div className="pt-2">
            <h5 className="text-[11px] uppercase tracking-wider text-neutral-300 mb-2">Subscribe to Atelier Dispatches</h5>
            <div className="flex max-w-sm">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-400"
              />
              <button className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 text-xs uppercase tracking-wider transition-colors flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 mt-1.5">Receive private previews, lookbooks, and invitations.</p>
          </div>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">Collections</h4>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li><Link href="/shop?category=outerwear-coats" className="hover:text-white transition-colors">Outerwear & Coats</Link></li>
            <li><Link href="/shop?category=hoodies-sweats" className="hover:text-white transition-colors">Hoodies & Sweats</Link></li>
            <li><Link href="/shop?category=shirts-tops" className="hover:text-white transition-colors">Shirts & Tops</Link></li>
            <li><Link href="/shop?category=tailored-trousers" className="hover:text-white transition-colors">Tailored Trousers</Link></li>
            <li><Link href="/shop?category=knitwear-sweaters" className="hover:text-white transition-colors">Knitwear</Link></li>
            <li><Link href="/shop?category=accessories-bags" className="hover:text-white transition-colors">Leather Goods</Link></li>
          </ul>
        </div>

        {/* Client Care */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">Client Care</h4>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li><Link href="/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
            <li><Link href="/profile" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
            <li><a href={`mailto:${APP_CONFIG.supportEmail}`} className="hover:text-white transition-colors">Concierge Assistance</a></li>
          </ul>
        </div>

        {/* Brand & Legal */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">Maison</h4>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li><Link href="/shop" className="hover:text-white transition-colors">Our Philosophy</Link></li>
            <li><Link href="/shop" className="hover:text-white transition-colors">Sustainability</Link></li>
            <li><Link href="/admin" className="hover:text-brand-300 transition-colors font-medium">Atelier Portal</Link></li>
            <li><span className="text-neutral-500">Terms of Service</span></li>
            <li><span className="text-neutral-500">Privacy Policy</span></li>
          </ul>
        </div>
      </div>

      {/* Copyright & Payment Badges */}
      <div className="border-t border-neutral-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-neutral-400 space-y-4 md:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name} Atelier Ltd. All rights reserved. Built with Next.js, Tailwind, MongoDB & Razorpay.
          </div>
          <div className="flex items-center space-x-3 text-neutral-400">
            <span className="px-2 py-0.5 border border-neutral-700 rounded text-[10px] tracking-wider uppercase">UPI</span>
            <span className="px-2 py-0.5 border border-neutral-700 rounded text-[10px] tracking-wider uppercase">Razorpay</span>
            <span className="px-2 py-0.5 border border-neutral-700 rounded text-[10px] tracking-wider uppercase">Visa</span>
            <span className="px-2 py-0.5 border border-neutral-700 rounded text-[10px] tracking-wider uppercase">Mastercard</span>
            <span className="px-2 py-0.5 border border-neutral-700 rounded text-[10px] tracking-wider uppercase">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
