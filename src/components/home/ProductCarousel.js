"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

export default function ProductCarousel({
  title,
  subtitle,
  products = [],
  viewAllHref = "/shop",
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header with Title and Scroll Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#EBE6DD]">
        <div>
          {subtitle && (
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#7F6650] font-medium block mb-1">
              {subtitle}
            </span>
          )}
          <h2 className="font-serif text-2xl sm:text-3xl text-[#242424] font-normal tracking-wide">
            {title}
          </h2>
        </div>

        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs uppercase tracking-widest text-[#242424] hover:text-[#7F6650] transition-colors flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Left / Right Carousel Controls */}
          <div className="flex items-center space-x-1.5 pl-2">
            <button
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full border border-[#D8CDBD] flex items-center justify-center text-[#242424] hover:bg-[#F1EDE5] transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full border border-[#D8CDBD] flex items-center justify-center text-[#242424] hover:bg-[#F1EDE5] transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((product) => (
          <div
            key={product.id || product.slug}
            className="w-[240px] sm:w-[280px] lg:w-[290px] flex-shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
