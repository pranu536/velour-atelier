import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Clock, Award } from "lucide-react";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/seed-data";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/common/Button";

export default function HomePage() {
  const featuredProducts = INITIAL_PRODUCTS.filter((p) => p.isFeatured).slice(0, 4);
  const newArrivals = INITIAL_PRODUCTS.filter((p) => p.isNewArrival).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. EDITORIAL HERO BANNER */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-neutral-900 text-white overflow-hidden">
        {/* Background Editorial Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
            alt="Velour Autumn Winter 2026 Campaign"
            fill
            priority
            className="object-cover object-center opacity-60 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-12 animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs tracking-ultra uppercase text-neutral-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Autumn / Winter 2026 Collection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase leading-tight sm:leading-none text-white drop-shadow-sm">
            Architectural <br />
            <span className="font-light italic text-brand-200">Silhouettes</span>
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-neutral-300 font-light tracking-wide leading-relaxed">
            Engineered heavyweight textiles, fluid tailored drape, and sculptural minimalism.
            Crafted for the discerning modern wardrobe.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              href="/shop"
              variant="gold"
              size="lg"
              className="w-full sm:w-auto shadow-xl flex items-center justify-center"
            >
              <span>Shop The Collection</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              href="/shop?gender=Women"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-noir-900"
            >
              View Women
            </Button>
            <Button
              href="/shop?gender=Men"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-noir-900"
            >
              View Men
            </Button>
          </div>
        </div>

        {/* Scroll indicator pill */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center space-y-2 text-neutral-400 text-[10px] uppercase tracking-ultra">
          <span>Scroll to explore</span>
          <div className="w-4 h-7 border border-white/30 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-white/70 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* 2. CURATED CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs uppercase tracking-ultra text-brand-600 font-semibold">
              The Wardrobe System
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-noir-900 mt-1">
              Curated Collections
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors mt-3 md:mt-0"
          >
            <span>View All Garments</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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

      {/* 3. FEATURED ATELIER PIECES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs uppercase tracking-ultra text-brand-600 font-semibold">
              Signature Silhouettes
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-noir-900 mt-1">
              Featured Atelier Essentials
            </h2>
          </div>
          <Link
            href="/shop?sort=price_desc"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors mt-3 md:mt-0"
          >
            <span>Explore High Craft</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </section>

      {/* 4. EDITORIAL ATELIER MANIFESTO */}
      <section className="bg-noir-900 text-white py-16 sm:py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-ultra text-brand-300 font-semibold">
              The Maison Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide leading-tight text-white">
              Tailored Precision. <br />
              <span className="font-light italic text-brand-200">Uncompromising Touch.</span>
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed max-w-lg">
              Each Velour piece begins with architectural discipline: from our 520 GSM custom loopback fleece to virgin cashmere overcoats and double-reverse pleat wool trousers. We design intentional garments crafted to outlive trend cycles.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-white">100%</p>
                <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Sustainable Certified Fibers</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-white">520 GSM</p>
                <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Dense Custom Loopback</p>
              </div>
            </div>
            <div className="pt-2">
              <Button href="/shop" variant="gold" size="md">
                Explore Lookbook
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-neutral-800 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
              alt="Atelier Craftsmanship"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS DROP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs uppercase tracking-ultra text-brand-600 font-semibold">
              Fresh Off The Loom
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-noir-900 mt-1">
              New Season Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors mt-3 md:mt-0"
          >
            <span>View All New Releases</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        <ProductGrid products={newArrivals} />
      </section>

      {/* 6. CLIENT PRIVILEGES & REPUTATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-50 border border-brand-200/60 rounded-sm p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white border border-brand-200 rounded-sm text-brand-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">Complimentary 24-Hour Dispatch</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Orders placed before 2 PM are hand-inspected, packed in luxury garment boxes, and couriered same day.
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
                Accepting UPI, Credit/Debit Cards, NetBanking, and EMI with state-of-the-art PCI-DSS compliance.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white border border-brand-200 rounded-sm text-brand-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900">14-Day Complimentary Exchange</h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Seamless size exchanges and return pickups scheduled from your doorstep with zero friction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
