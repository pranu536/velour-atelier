"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, SlidersHorizontal, ArrowUpDown, X, Sparkles, Loader2 } from "lucide-react";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/seed-data";
import { GENDERS, SORT_OPTIONS } from "@/lib/constants";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/common/Button";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Query state
  const activeCategory = searchParams.get("category") || "all";
  const activeGender = searchParams.get("gender") || "all";
  const searchQuery = searchParams.get("search") || "";
  const activeSort = searchParams.get("sort") || "newest";

  // Filter UI states
  const [selectedCategory, setSelectedCategory] = useState(activeCategory);
  const [selectedGender, setSelectedGender] = useState(activeGender);
  const [selectedSort, setSelectedSort] = useState(activeSort);
  const [priceMax, setPriceMax] = useState(15000);
  const [isFilterOpenMobile, setIsFilterOpenMobile] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "all");
    setSelectedGender(searchParams.get("gender") || "all");
    setSelectedSort(searchParams.get("sort") || "newest");
  }, [searchParams]);

  const updateFilters = (newCategory, newGender, newSort) => {
    const params = new URLSearchParams();
    if (newCategory && newCategory !== "all") params.set("category", newCategory);
    if (newGender && newGender !== "all") params.set("gender", newGender);
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    if (searchQuery) params.set("search", searchQuery);

    router.push(`/shop?${params.toString()}`);
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    updateFilters(slug, selectedGender, selectedSort);
  };

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    updateFilters(selectedCategory, gender, selectedSort);
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    updateFilters(selectedCategory, selectedGender, sort);
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedGender("all");
    setSelectedSort("newest");
    setPriceMax(15000);
    router.push("/shop");
  };

  // Filtered & sorted product list
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== "all" && product.categorySlug !== selectedCategory) {
        return false;
      }
      // Gender filter
      if (selectedGender !== "all" && product.gender !== selectedGender && product.gender !== "Unisex") {
        return false;
      }
      // Price filter
      if (product.price > priceMax) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesTag = product.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTag) return false;
      }
      return true;
    }).sort((a, b) => {
      if (selectedSort === "price_asc") return a.price - b.price;
      if (selectedSort === "price_desc") return b.price - a.price;
      if (selectedSort === "rating") return b.rating - a.rating;
      return 0; // default newest
    });
  }, [selectedCategory, selectedGender, selectedSort, priceMax, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Breadcrumb */}
      <div className="pb-8 border-b border-neutral-200">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400">
          <span>Maison</span>
          <span>/</span>
          <span className="text-noir-900 font-semibold">Atelier Wardrobe</span>
          {searchQuery && (
            <>
              <span>/</span>
              <span className="text-brand-600 font-medium">Search: &quot;{searchQuery}&quot;</span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mt-3">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-noir-900">
              The Wardrobe Catalog
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-xl">
              Engineered garments, architectural silhouettes, and organic textiles.
              Displaying {filteredProducts.length} pieces.
            </p>
          </div>

          {/* Quick Active Gender Filter Pills */}
          <div className="flex items-center space-x-2 mt-4 md:mt-0 overflow-x-auto pb-2 md:pb-0">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                onClick={() => handleGenderChange(g.value)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors border ${
                  selectedGender === g.value
                    ? "bg-noir-900 text-white border-noir-900 font-medium"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 pr-4 border-r border-neutral-200">
          {/* Active Filter Clear */}
          {(selectedCategory !== "all" ||
            selectedGender !== "all" ||
            searchQuery ||
            priceMax < 15000) && (
            <div className="pb-4 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-noir-900">
                Filters Applied
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:underline uppercase tracking-wider"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Category List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-noir-900 mb-3">
              Categories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`block text-xs uppercase tracking-wider text-left transition-colors w-full ${
                  selectedCategory === "all"
                    ? "text-noir-900 font-bold"
                    : "text-neutral-500 hover:text-noir-900"
                }`}
              >
                All Garments
              </button>
              {INITIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`block text-xs uppercase tracking-wider text-left transition-colors w-full ${
                    selectedCategory === cat.slug
                      ? "text-noir-900 font-bold"
                      : "text-neutral-500 hover:text-noir-900"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-noir-900">
                Max Price
              </h3>
              <span className="text-xs font-semibold text-noir-900">
                ₹{priceMax.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1500"
              max="15000"
              step="500"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-noir-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>₹1,500</span>
              <span>₹15,000+</span>
            </div>
          </div>

          {/* Sustainability & Quality Note */}
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-sm">
            <div className="flex items-center space-x-2 text-brand-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Velour Craft Guarantee</span>
            </div>
            <p className="text-[11px] text-brand-900 mt-1.5 leading-relaxed">
              Every piece includes complimentary garment bags and comes with our 14-day fit guarantee.
            </p>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar: Mobile Filter Trigger + Sort dropdown */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpenMobile(true)}
              className="lg:hidden flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-noir-900 px-3 py-2 border border-neutral-300 rounded-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Product Counter */}
            <span className="hidden sm:inline text-xs text-neutral-400 uppercase tracking-widest">
              Showing {filteredProducts.length} Results
            </span>

            {/* Sort Selector */}
            <div className="flex items-center space-x-2 ml-auto">
              <label
                htmlFor="sort-select"
                className="text-xs uppercase tracking-wider text-neutral-500 hidden sm:inline"
              >
                Sort:
              </label>
              <select
                id="sort-select"
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-xs uppercase tracking-wider bg-white border border-neutral-200 text-noir-900 py-2 px-3 focus:outline-none focus:border-noir-900"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={filteredProducts}
            emptyMessage="No pieces match your selected combination of categories, gender, and price range. Try broadening your filter selection."
          />
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isFilterOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsFilterOpenMobile(false)}
          />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl p-6 flex flex-col z-10 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-xs font-bold uppercase tracking-widest text-noir-900">
                Refine Wardrobe
              </h3>
              <button
                onClick={() => setIsFilterOpenMobile(false)}
                className="p-1 text-neutral-400 hover:text-noir-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-700 mb-3">
                  Categories
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleCategoryChange("all");
                      setIsFilterOpenMobile(false);
                    }}
                    className={`block text-xs uppercase tracking-wider text-left w-full ${
                      selectedCategory === "all" ? "font-bold text-noir-900" : "text-neutral-500"
                    }`}
                  >
                    All Garments
                  </button>
                  {INITIAL_CATEGORIES.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => {
                        handleCategoryChange(c.slug);
                        setIsFilterOpenMobile(false);
                      }}
                      className={`block text-xs uppercase tracking-wider text-left w-full ${
                        selectedCategory === c.slug
                          ? "font-bold text-noir-900"
                          : "text-neutral-500"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-700">
                    Max Price
                  </h4>
                  <span className="text-xs font-semibold text-noir-900">
                    ₹{priceMax.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="1500"
                  max="15000"
                  step="500"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-noir-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex space-x-3">
              <Button
                variant="outline"
                size="md"
                className="w-1/2"
                onClick={() => {
                  clearAllFilters();
                  setIsFilterOpenMobile(false);
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="md"
                className="w-1/2"
                onClick={() => setIsFilterOpenMobile(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-noir-900" />
          <span className="text-xs uppercase tracking-widest text-neutral-500">
            Curating Atelier Wardrobe...
          </span>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
