"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AnnouncementBar() {
  const announcements = [
    { text: "Complimentary Express Shipping on all orders above ₹2,499", link: "/shop" },
    { text: "New Season Arrivals: Men, Women, Kids & Unisex Collections", link: "/shop?sort=newest" },
    { text: "Seamless 14-Day Doorstep Exchanges & Instant Pickups", link: "/orders" },
    { text: "Matching Sets & Organic Loungewear Drops Now Live", link: "/shop?category=hoodies-sweats" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  return (
    <div className="bg-[#242424] text-[#F8F6F1] text-[11px] font-normal tracking-widest uppercase py-2 px-4 border-b border-[#333333] transition-colors relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side: Subtle Department Quick Access on Desktop */}
        <div className="hidden lg:flex items-center space-x-3 text-[#D8CDBD] text-[10px]">
          <Link href="/shop?gender=Women" className="hover:text-white transition-colors">Women</Link>
          <span className="text-[#4D4D4D]">•</span>
          <Link href="/shop?gender=Men" className="hover:text-white transition-colors">Men</Link>
          <span className="text-[#4D4D4D]">•</span>
          <Link href="/shop?gender=Kids" className="hover:text-white transition-colors">Kids</Link>
          <span className="text-[#4D4D4D]">•</span>
          <Link href="/shop?gender=Unisex" className="hover:text-white transition-colors">Unisex</Link>
        </div>

        {/* Center: Sliding Promo Ticker */}
        <div className="flex-1 flex items-center justify-center space-x-3">
          <button
            onClick={handlePrev}
            className="p-0.5 text-[#D8CDBD] hover:text-white transition-colors"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="overflow-hidden h-4 text-center min-w-[280px] sm:min-w-[420px]">
            <Link
              href={announcements[currentIndex].link}
              className="inline-block transition-all duration-500 ease-out hover:underline underline-offset-4"
            >
              <span>{announcements[currentIndex].text}</span>
            </Link>
          </div>

          <button
            onClick={handleNext}
            className="p-0.5 text-[#D8CDBD] hover:text-white transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side: Currency & Concierge */}
        <div className="hidden sm:flex items-center space-x-4 text-[#D8CDBD] text-[10px]">
          <span className="text-[#F8F6F1]">INR (₹)</span>
          <span className="text-[#4D4D4D]">|</span>
          <Link href="/orders" className="hover:text-white transition-colors">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
