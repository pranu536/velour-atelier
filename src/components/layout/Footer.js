import Link from "next/link";
import { APP_CONFIG } from "@/lib/constants";
import { ArrowUpRight, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#242424] text-[#F8F6F1] border-t border-[#333333]">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* 1. About Velour */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block text-2xl font-serif tracking-[0.2em] text-[#F8F6F1]">
            {APP_CONFIG.name}
          </Link>
          <p className="text-xs text-[#D8CDBD] max-w-sm leading-relaxed">
            Velour is a contemporary clothing and lifestyle fashion brand for everyone. Thoughtfully designed essentials spanning Men, Women, Kids, and Unisex collections—crafted for supreme everyday comfort, quiet luxury, and lasting form.
          </p>
          {/* Social Media Links */}
          <div className="pt-2">
            <h5 className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">
              Connect With Atelier
            </h5>
            <div className="flex items-center space-x-4 text-xs text-[#D8CDBD]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>Instagram</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>Pinterest</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center space-x-1"
              >
                <span>YouTube</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* 2. Customer Support & Contact */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#F8F6F1] mb-4">
            Customer Support
          </h4>
          <ul className="space-y-2.5 text-xs text-[#D8CDBD]">
            <li><Link href="/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">Shipping Information</Link></li>
            <li><Link href="/orders" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
            <li><a href={`mailto:${APP_CONFIG.supportEmail}`} className="hover:text-white transition-colors">Contact Concierge</a></li>
          </ul>
        </div>

        {/* 3. Collections & Lines */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#F8F6F1] mb-4">
            Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-[#D8CDBD]">
            <li><Link href="/shop?gender=Women" className="hover:text-white transition-colors">Women's Collection</Link></li>
            <li><Link href="/shop?gender=Men" className="hover:text-white transition-colors">Men's Collection</Link></li>
            <li><Link href="/shop?gender=Kids" className="hover:text-white transition-colors">Kids' Collection</Link></li>
            <li><Link href="/shop?gender=Unisex" className="hover:text-white transition-colors">Unisex Archetypes</Link></li>
            <li><Link href="/shop?category=hoodies-sweats" className="hover:text-white transition-colors">Matching Sets</Link></li>
            <li><Link href="/shop?sort=newest" className="hover:text-white transition-colors">New Season Drops</Link></li>
          </ul>
        </div>

        {/* 4. Policies & Terms */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#F8F6F1] mb-4">
            Information
          </h4>
          <ul className="space-y-2.5 text-xs text-[#D8CDBD]">
            <li><Link href="/shop" className="hover:text-white transition-colors">Fashion Philosophy</Link></li>
            <li><Link href="/shop" className="hover:text-white transition-colors">Sustainable Sourcing</Link></li>
            <li><Link href="/admin" className="hover:text-brand-300 transition-colors font-medium">Atelier Portal</Link></li>
            <li><span className="text-neutral-500 cursor-pointer hover:text-white transition-colors">Privacy Policy</span></li>
            <li><span className="text-neutral-500 cursor-pointer hover:text-white transition-colors">Terms and Conditions</span></li>
          </ul>
        </div>
      </div>

      {/* Copyright & Payment Badges */}
      <div className="border-t border-[#333333] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#A99882] space-y-4 md:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name} Fashion Brand. All rights reserved.
          </div>
          <div className="flex items-center space-x-2 text-[10px] tracking-wider uppercase text-neutral-400">
            <span className="px-2 py-0.5 border border-[#444444] rounded-none">UPI</span>
            <span className="px-2 py-0.5 border border-[#444444] rounded-none">Razorpay</span>
            <span className="px-2 py-0.5 border border-[#444444] rounded-none">Visa</span>
            <span className="px-2 py-0.5 border border-[#444444] rounded-none">Mastercard</span>
            <span className="px-2 py-0.5 border border-[#444444] rounded-none">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

