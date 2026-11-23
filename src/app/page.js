import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Clock, Award, Flame, Star, Layers } from "lucide-react";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/seed-data";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/common/Button";

export default function HomePage() {
  // New Arrivals, Trending, and Signature Featured pieces
  const newArrivals = INITIAL_PRODUCTS.filter((p) => p.isNewArrival).slice(0, 4);
  const trendingProducts = INITIAL_PRODUCTS.filter((p) => p.isTrending).slice(0, 4);
  const featuredProducts = INITIAL_PRODUCTS.filter((p) => p.isFeatured).slice(0, 4);

  // Four separate shopping departments
  const departments = [
    {
      title: "Women's Atelier",
      subtitle: "Tailored overcoats, fluid silk dresses & chunky cardigans",
      href: "/shop?gender=Women",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
      badge: "Women",
    },
    {
      title: "Men's Atelier",
      subtitle: "Peak-lapel overcoats, Cuban silk shirts & wide pleats",
      href: "/shop?gender=Men",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
      badge: "Men",
    },
    {
      title: "Kids Atelier",
      subtitle: "Organic mini trenches, soft cable knits & loopback hoodies",
      href: "/shop?gender=Kids",
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1000&auto=format&fit=crop",
      badge: "Kids (3-12Y)",
    },
    {
      title: "Unisex Archetypes",
      subtitle: "Heavyweight 520 GSM fleece, full-grain leather & minimal tees",
      href: "/shop?gender=Unisex",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
      badge: "Unisex",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. LARGE FASHION CAMPAIGN BANNER */}
      <section className="relative min-h-[88vh] flex items-center justify-center bg-noir-900 text-white overflow-hidden">
        {/* Background Editorial Visual */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
            alt="Velour Universal Campaign Autumn Winter 2026"
            fill
            priority
            className="object-cover object-center opacity-65 scale-105 transition-transform duration-1000"
          />
          {/* Subtle warm luxury vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-900/50 to-noir-950/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-10 animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs tracking-ultra uppercase text-neutral-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Autumn / Winter 2026 Collection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase leading-tight text-white drop-shadow-sm">
            Architectural Essentials <br />
            <span className="font-light italic text-brand-200">For Every Wardrobe</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-300 font-light tracking-wide leading-relaxed">
            Contemporary luxury reimagined across Women, Men, Kids, and Unisex collections.
            Crafted from virgin wool, 520 GSM loopback cotton, and Italian full-grain leather.
          </p>

          {/* 4 Separate Shopping Department Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            <Button
              href="/shop?gender=Women"
              variant="gold"
              size="lg"
              className="px-6 py-3 shadow-xl"
            >
              Shop Women
            </Button>
            <Button
              href="/shop?gender=Men"
              variant="outline"
              size="lg"
              className="px-6 py-3 text-white border-white hover:bg-white hover:text-noir-900"
            >
              Shop Men
            </Button>
            <Button
              href="/shop?gender=Kids"
              variant="outline"
              size="lg"
              className="px-6 py-3 text-white border-white hover:bg-white hover:text-noir-900"
            >
              Shop Kids
            </Button>
            <Button
              href="/shop?gender=Unisex"
              variant="outline"
              size="lg"
              className="px-6 py-3 text-white border-white hover:bg-white hover:text-noir-900"
            >
              Shop Unisex
            </Button>
          </div>
        </div>

        {/* Scroll indicator pill */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center space-y-2 text-neutral-400 text-[10px] uppercase tracking-ultra">
          <span>Explore Atelier</span>
          <div className="w-4 h-7 border border-white/30 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-white/70 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* 2. FOUR SEPARATE SHOPPING DEPARTMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-ultra text-brand-600 font-semibold">
            Universal Wardrobe Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-wide text-noir-900 mt-1">
            Shop By Department
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Engineered silhouettes tailored for each audience, from adult tailoring to mini essentials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept) => (
            <Link
              key={dept.title}
              href={dept.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100 flex flex-col justify-end p-6 text-white shadow-sm border border-neutral-200/50"
            >
              <Image
                src={dept.image}
                alt={dept.title}
                fill
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors" />
              <div className="relative z-10 space-y-2">
                <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/30 text-[10px] uppercase tracking-wider font-semibold rounded">
                  {dept.badge}
                </span>
                <h3 className="font-serif text-xl font-bold uppercase tracking-wide text-white group-hover:text-brand-200 transition-colors">
                  {dept.title}
                </h3>
                <p className="text-xs text-neutral-300 leading-snug line-clamp-2">
                  {dept.subtitle}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-brand-300 group-hover:text-white transition-colors">
                    <span>Shop Department</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS ACROSS ALL AUDIENCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs uppercase tracking-ultra text-brand-600 font-semibold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Off The Loom</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-noir-900 mt-1">
              New Season Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors mt-3 md:mt-0"
          >
            <span>View All New Releases ({INITIAL_PRODUCTS.filter(p => p.isNewArrival).length})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        <ProductGrid products={newArrivals} />
      </section>

      {/* 4. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs uppercase tracking-ultra text-amber-700 font-semibold flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Most Desired Silhouettes</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-noir-900 mt-1">
              Trending Atelier Pieces
            </h2>
          </div>
          <Link
            href="/shop?sort=trending"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors mt-3 md:mt-0"
          >
            <span>Explore Trending Drops &rarr;</span>
          </Link>
        </div>

        <ProductGrid products={trendingProducts} />
      </section>

      {/* 5. EDITORIAL MAISON MANIFESTO */}
      <section className="bg-noir-900 text-white py-16 sm:py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-ultra text-brand-300 font-semibold">
              The Maison Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide leading-tight text-white">
              Tailored Precision. <br />
              <span className="font-light italic text-brand-200">Across Generations.</span>
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed max-w-lg">
              Velour designs intentional wardrobe pieces free from disposable trend cycles. From bespoke 520 GSM loopback cotton hoodies to virgin cashmere overcoats and hypoallergenic junior wool jumpers, each garment is engineered for comfort, form, and longevity.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800 text-center sm:text-left">
              <div>
                <p className="font-serif text-2xl font-bold text-white">100%</p>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider mt-1">Certified Fibers</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-white">520 GSM</p>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider mt-1">Dense Fleece</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-white">4 Lines</p>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wider mt-1">Men, Women, Kids, Unisex</p>
              </div>
            </div>
            <div className="pt-2 flex space-x-3">
              <Button href="/shop" variant="gold" size="md">
                Explore Full Catalog
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-800 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop"
              alt="Velour Craftsmanship"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* 6. CATEGORY-BASED BROWSING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs uppercase tracking-ultra text-brand-600 font-semibold">
              The Wardrobe System
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-noir-900 mt-1">
              Curated Garment Categories
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors mt-3 md:mt-0"
          >
            <span>All Categories &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {INITIAL_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100 flex flex-col justify-end p-3 sm:p-4 text-white"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
              <div className="relative z-10">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider leading-tight group-hover:text-brand-200 transition-colors">
                  {category.name}
                </h3>
                <span className="text-[10px] text-neutral-300 uppercase tracking-widest mt-1 inline-block opacity-80 group-hover:opacity-100">
                  Shop Now &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. CLIENT PRIVILEGES & REPUTATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-50 border border-brand-200/60 rounded-sm p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white border border-brand-200 rounded-sm text-brand-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">Complimentary Courier Dispatch</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Hand-inspected, wrapped in luxury garment boxes, and dispatched within 24 hours on orders over ₹2,499.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white border border-brand-200 rounded-sm text-brand-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">Encrypted Razorpay Checkout</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Secure checkout supporting UPI, Credit/Debit cards, NetBanking, and EMI with PCI-DSS 256-bit encryption.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white border border-brand-200 rounded-sm text-brand-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">14-Day Doorstep Exchanges</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Complimentary fit exchanges and hassle-free returns scheduled directly from your home.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
