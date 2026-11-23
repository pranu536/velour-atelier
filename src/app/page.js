import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Feather, Leaf } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import ProductCarousel from "@/components/home/ProductCarousel";
import NewsletterSection from "@/components/home/NewsletterSection";
import Button from "@/components/common/Button";

export default async function HomePage() {
  // Live MongoDB queries via Prisma ORM
  let featuredProducts = [];
  let newArrivals = [];
  let newArrivalsCount = 0;

  try {
    const [featured, arrivals, count] = await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true },
        include: { category: true },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { isNewArrival: true },
        include: { category: true },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({
        where: { isNewArrival: true },
      }),
    ]);

    featuredProducts = featured.map((p) => ({
      ...p,
      isBestseller: p.tags?.includes("bestseller") || p.rating >= 4.9,
    }));

    newArrivals = arrivals.map((p) => ({
      ...p,
      isBestseller: p.tags?.includes("bestseller"),
    }));

    newArrivalsCount = count;
  } catch (error) {
    console.error("HomePage live data fetch error:", error);
  }

  // Four separate visual collections
  const collections = [
    {
      title: "Women's Collection",
      gender: "Women",
      subtitle: "Tailored coats, fine gauge knits & fluid drape",
      href: "/shop?gender=Women",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "Men's Collection",
      gender: "Men",
      subtitle: "Architectural overcoats & relaxed essentials",
      href: "/shop?gender=Men",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "Kids' Collection",
      gender: "Kids",
      subtitle: "Mini organic trenches & hypoallergenic knits",
      href: "/shop?gender=Kids",
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "Unisex Archetypes",
      gender: "Unisex",
      subtitle: "Heavyweight 520 GSM fleece & boxy tees",
      href: "/shop?gender=Unisex",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
    },
  ];

  // Why Choose Velour 4 Pillars
  const benefits = [
    {
      icon: Feather,
      title: "Pure Natural Fabrics",
      desc: "Spun from certified organic cotton, pure lambswool, and soft mulberry silk blends for skin-kind comfort.",
    },
    {
      icon: Leaf,
      title: "Everyday Ease & Comfort",
      desc: "Breathable, temperature-regulating textiles and relaxed drape engineered for effortless daily living.",
    },
    {
      icon: Sparkles,
      title: "Thoughtful Design",
      desc: "Quiet architectural silhouettes and a soothing neutral palette that coordinates seamlessly.",
    },
    {
      icon: ShieldCheck,
      title: "Lasting Craftsmanship",
      desc: "Reinforced construction and durable finishes designed to outlast transient fast-fashion cycles.",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 bg-[#F8F6F1] text-[#242424]">
      {/* ========================================================
          C. HERO SECTION
          Large, high-quality fashion lifestyle image as main visual focus,
          short campaign heading, minimal supporting text, Shop Now button.
      ======================================================== */}
      <section className="relative min-h-[82vh] sm:min-h-[88vh] flex items-center justify-center overflow-hidden">
        {/* Background Fashion Lifestyle Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
            alt="Velour Campaign Editorial"
            fill
            priority
            className="object-cover object-center scale-100 transition-transform duration-1000"
            sizes="100vw"
          />
          {/* Subtle soft natural overlay to ensure clean readability without dark heavy gradients */}
          <div className="absolute inset-0 bg-black/25 backdrop-brightness-95" />
        </div>

        {/* Minimal Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center text-white space-y-5 animate-fade-in py-12">
          <span className="text-[11px] uppercase tracking-[0.26em] font-medium text-[#F8F6F1] drop-shadow-sm block">
            Autumn / Winter Capsule
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight uppercase leading-[1.08] text-white drop-shadow-sm">
            Comfort in <br />
            <span className="italic font-light text-[#F1EDE5]">Every Thread</span>
          </h1>

          <p className="max-w-lg mx-auto text-xs sm:text-sm text-neutral-100 font-light tracking-wide leading-relaxed drop-shadow-sm">
            Thoughtfully crafted modern clothing for everyone. Natural fibers, calm silhouettes, and effortless everyday elegance.
          </p>

          <div className="pt-3">
            <Button
              href="/shop"
              variant="primary"
              size="lg"
              className="bg-white text-[#242424] hover:bg-[#F1EDE5] px-8 py-3.5 tracking-[0.2em] text-xs uppercase font-medium shadow-md transition-all duration-300"
            >
              Shop Now
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================
          D. SHOP BY COLLECTION
          Separate visual collections for Men, Women, Kids and Unisex.
          Large photography with simple Shop Now links.
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[#7F6650] font-medium block mb-1">
            Carefully Curated
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-normal tracking-tight">
            Shop by Collection
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-light mt-2">
            Explore dedicated wardrobe lines tailored for your lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {collections.map((col) => (
            <Link
              key={col.title}
              href={col.href}
              className="group relative aspect-[3/4] overflow-hidden bg-[#F1EDE5] flex flex-col justify-end p-6 border border-[#EBE6DD] transition-all duration-500 hover:border-[#D8CDBD]"
            >
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Subtle bottom gradient to ensure readable white text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/75 transition-colors" />

              <div className="relative z-10 text-white space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-[#D8CDBD] font-medium block">
                  {col.gender}
                </span>
                <h3 className="font-serif text-xl font-normal text-white group-hover:text-[#F8F6F1] transition-colors">
                  {col.title}
                </h3>
                <p className="text-[11px] text-neutral-200 line-clamp-1 font-light opacity-90">
                  {col.subtitle}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center text-[11px] uppercase tracking-widest font-medium text-white group-hover:underline underline-offset-4 transition-all">
                    <span>Shop Now</span>
                    <ArrowRight className="w-3 h-3 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          E. FEATURED PRODUCTS
          Horizontal product carousel with image, name, price, discount,
          Quick Add, Wishlist, and New Arrival/Bestseller badges.
      ======================================================== */}
      <ProductCarousel
        title="Featured Products"
        subtitle="Curated Essentials"
        products={featuredProducts}
        viewAllHref="/shop"
      />

      {/* ========================================================
          F. NEW ARRIVALS
          Product grid with attractive photography, View All link,
          and Quick Add functionality.
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#EBE6DD]">
          <div>
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#7F6650] font-medium block mb-1">
              Fresh Off The Loom
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#242424] font-normal tracking-wide">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?sort=newest"
            className="text-xs uppercase tracking-widest text-[#242424] hover:text-[#7F6650] transition-colors flex items-center space-x-1 mt-3 sm:mt-0"
          >
            <span>View All ({newArrivalsCount})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* 4 Cards per row on desktop, 2 on tablet, 2 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.slice(0, 8).map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* ========================================================
          G. MATCHING SETS / FEATURED COLLECTIONS
          Wide lifestyle banner, short collection description,
          Explore Collection button.
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[460px] sm:min-h-[520px] overflow-hidden flex items-center justify-center p-8 sm:p-14 text-center bg-[#F1EDE5] border border-[#EBE6DD]">
          <Image
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2000&auto=format&fit=crop"
            alt="Velour Matching Sets Collection"
            fill
            className="object-cover object-center scale-100"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          {/* Subtle soft backdrop layer */}
          <div className="absolute inset-0 bg-black/35 backdrop-brightness-95" />

          <div className="relative z-10 max-w-xl mx-auto text-white space-y-4">
            <span className="text-[11px] uppercase tracking-[0.24em] font-medium text-[#F8F6F1] block">
              Coordinated Harmony
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Matching Sets & Loungewear
            </h2>
            <p className="text-xs sm:text-sm text-neutral-100 font-light leading-relaxed max-w-md mx-auto">
              Effortless two-piece sets in heavyweight French terry and breathable organic fleece. Cut for a relaxed silhouette that moves naturally with you.
            </p>
            <div className="pt-3">
              <Button
                href="/shop?category=hoodies-sweats"
                variant="primary"
                size="md"
                className="bg-white text-[#242424] hover:bg-[#F1EDE5] px-7 py-3 text-xs uppercase tracking-widest font-medium"
              >
                Explore Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          H. BRAND STORY
          Lifestyle image and a short introduction to Velour,
          explaining the brand's fashion philosophy.
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center bg-white border border-[#EBE6DD] p-6 sm:p-12">
          {/* Lifestyle Visual */}
          <div className="relative aspect-[4/5] bg-[#F8F6F1] overflow-hidden order-2 lg:order-1">
            <Image
              src="https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop"
              alt="Velour Craftsmanship and Philosophy"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Story Narrative */}
          <div className="space-y-6 order-1 lg:order-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[#7F6650] font-medium block">
              Our Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-normal tracking-tight leading-tight">
              Designed for Living. <br />
              <span className="italic font-light text-neutral-500">Made to Last.</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
              Velour was born from a desire for clothing that feels as calm and intentional as a quiet morning. We reject the pressure of disposable fashion seasons in favor of tactile organic textiles, generous tailoring, and honest construction.
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
              Every coat, sweater, tee, and matching set is created with the belief that true luxury is comfort you can live in every single day—across Men, Women, Kids, and Unisex collections.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center text-xs uppercase tracking-widest font-medium text-[#242424] hover:text-[#7F6650] transition-colors border-b border-[#242424] pb-1"
              >
                <span>Read the Atelier Journal</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          I. WHY CHOOSE VELOUR
          Three or four simple benefits: quality, comfort, everyday style,
          and thoughtful design.
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[#7F6650] font-medium block mb-1">
            Mindful Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-normal tracking-tight">
            Why Choose Velour
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-light mt-2">
            Thoughtful details that elevate your daily wardrobe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div
                key={i}
                className="bg-white border border-[#EBE6DD] p-7 text-center space-y-3 transition-colors hover:border-[#D8CDBD]"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-[#F8F6F1] flex items-center justify-center text-[#7F6650] border border-[#EBE6DD]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-normal text-[#242424]">
                  {benefit.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          J. NEWSLETTER
          Minimal email subscription section with attractive heading
          and simple email input.
      ======================================================== */}
      <NewsletterSection />
    </div>
  );
}
