"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Sparkles,
  Loader2,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  GENDERS,
  ADULT_SIZES,
  KIDS_SIZES,
  ALL_SIZES,
  FILTER_COLORS,
  SORT_OPTIONS,
} from "@/lib/constants";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/common/Button";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Live database state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // URL state
  const activeCategory = searchParams.get("category") || "all";
  const activeGender = searchParams.get("gender") || "all";
  const searchQuery = searchParams.get("search") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const activeSize = searchParams.get("size") || "all";
  const activeColor = searchParams.get("color") || "all";

  // Filter UI states
  const [selectedCategory, setSelectedCategory] = useState(activeCategory);
  const [selectedGender, setSelectedGender] = useState(activeGender);
  const [selectedSort, setSelectedSort] = useState(activeSort);
  const [selectedSize, setSelectedSize] = useState(activeSize);
  const [selectedColor, setSelectedColor] = useState(activeColor);
  const [priceMax, setPriceMax] = useState(15000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpenMobile, setIsFilterOpenMobile] = useState(false);

  // Fetch live products and categories from Next.js MongoDB API
  const fetchCatalogData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?limit=100"),
        fetch("/api/categories"),
      ]);

      if (!prodRes.ok) {
        throw new Error("Unable to retrieve garments from database.");
      }
      if (!catRes.ok) {
        throw new Error("Unable to retrieve categories from database.");
      }

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
    } catch (err) {
      console.error("Shop live data fetch error:", err);
      setFetchError(err.message || "Failed to connect to database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  // Sync state when URL search params change
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "all");
    setSelectedGender(searchParams.get("gender") || "all");
    setSelectedSort(searchParams.get("sort") || "newest");
    setSelectedSize(searchParams.get("size") || "all");
    setSelectedColor(searchParams.get("color") || "all");
  }, [searchParams]);

  // Sync filters to URL query
  const updateFilters = (newParams) => {
    const params = new URLSearchParams();
    const cat = newParams.category !== undefined ? newParams.category : selectedCategory;
    const gen = newParams.gender !== undefined ? newParams.gender : selectedGender;
    const srt = newParams.sort !== undefined ? newParams.sort : selectedSort;
    const sz = newParams.size !== undefined ? newParams.size : selectedSize;
    const col = newParams.color !== undefined ? newParams.color : selectedColor;

    if (cat && cat !== "all") params.set("category", cat);
    if (gen && gen !== "all") params.set("gender", gen);
    if (srt && srt !== "newest") params.set("sort", srt);
    if (sz && sz !== "all") params.set("size", sz);
    if (col && col !== "all") params.set("color", col);
    if (searchQuery) params.set("search", searchQuery);

    router.push(`/shop?${params.toString()}`);
  };

  const handleGenderChange = (val) => {
    setSelectedGender(val);
    // If switching to/from Kids, clear size to prevent incompatible size selections
    const newSize = val === "Kids" && !KIDS_SIZES.includes(selectedSize) ? "all" : selectedSize;
    setSelectedSize(newSize);
    updateFilters({ gender: val, size: newSize });
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    updateFilters({ category: slug });
  };

  const handleSizeChange = (size) => {
    const next = selectedSize === size ? "all" : size;
    setSelectedSize(next);
    updateFilters({ size: next });
  };

  const handleColorChange = (colorName) => {
    const next = selectedColor === colorName ? "all" : colorName;
    setSelectedColor(next);
    updateFilters({ color: next });
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    updateFilters({ sort });
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedGender("all");
    setSelectedSort("newest");
    setSelectedSize("all");
    setSelectedColor("all");
    setPriceMax(15000);
    setInStockOnly(false);
    router.push("/shop");
  };

  // Determine which sizes to show in the filter
  const availableSizes = useMemo(() => {
    if (selectedGender === "Kids") return KIDS_SIZES;
    if (selectedGender === "Women" || selectedGender === "Men" || selectedGender === "Unisex") {
      return ADULT_SIZES;
    }
    return ALL_SIZES;
  }, [selectedGender]);

  // Multi-attribute Filtered & Sorted Product List
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Gender / Audience filter
      if (selectedGender !== "all") {
        if (selectedGender === "Kids" && product.gender !== "Kids") return false;
        if (selectedGender === "Men" && product.gender !== "Men" && product.gender !== "Unisex") return false;
        if (selectedGender === "Women" && product.gender !== "Women" && product.gender !== "Unisex") return false;
        if (selectedGender === "Unisex" && product.gender !== "Unisex") return false;
      }

      // 2. Category filter
      const catSlug = product.category?.slug || product.categorySlug;
      if (selectedCategory !== "all" && catSlug !== selectedCategory) {
        return false;
      }

      // 3. Size filter
      if (selectedSize !== "all" && (!product.sizes || !product.sizes.includes(selectedSize))) {
        return false;
      }

      // 4. Color filter
      if (selectedColor !== "all") {
        const hasColor = product.colors?.some((c) =>
          c.name.toLowerCase().includes(selectedColor.toLowerCase())
        );
        if (!hasColor) return false;
      }

      // 5. Price filter
      if (product.price > priceMax) {
        return false;
      }

      // 6. In-Stock Availability filter
      if (inStockOnly && (!product.inStock || product.stockCount <= 0)) {
        return false;
      }

      // 7. Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesGender = product.gender.toLowerCase().includes(q);
        const matchesTag = product.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTag && !matchesGender) return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === "price_asc") return a.price - b.price;
      if (selectedSort === "price_desc") return b.price - a.price;
      if (selectedSort === "rating") return b.rating - a.rating;
      if (selectedSort === "trending") {
        return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) || b.rating - a.rating;
      }
      return 0; // default newest
    });
  }, [
    selectedCategory,
    selectedGender,
    selectedSort,
    selectedSize,
    selectedColor,
    priceMax,
    inStockOnly,
    searchQuery,
  ]);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedGender !== "all" ||
    selectedSize !== "all" ||
    selectedColor !== "all" ||
    priceMax < 15000 ||
    inStockOnly ||
    searchQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header & Breadcrumb */}
      <div className="pb-8 border-b border-neutral-200">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400">
          <button onClick={() => router.push("/")} className="hover:text-noir-900 transition-colors">
            Maison
          </button>
          <span>/</span>
          <span className="text-noir-900 font-semibold">Atelier Wardrobe</span>
          {searchQuery && (
            <>
              <span>/</span>
              <span className="text-brand-600 font-medium inline-flex items-center">
                Search: &quot;{searchQuery}&quot;
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("search");
                    router.push(`/shop?${params.toString()}`);
                  }}
                  className="ml-1.5 p-0.5 text-neutral-400 hover:text-noir-900 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mt-3 gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-noir-900">
              {selectedGender === "all"
                ? "The Complete Wardrobe"
                : `${selectedGender}'s Atelier Collection`}
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-xl">
              Architectural silhouettes and sustainable fabrics across Men, Women, Kids, and Unisex collections.
              Displaying {filteredProducts.length} pieces.
            </p>
          </div>

          {/* Quick Audience / Gender Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                onClick={() => handleGenderChange(g.value)}
                className={`px-3.5 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors border font-medium whitespace-nowrap ${
                  selectedGender === g.value
                    ? "bg-noir-900 text-white border-noir-900 shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-7 pr-6 border-r border-neutral-200">
          {/* Active Filter Clear Header */}
          {hasActiveFilters && (
            <div className="pb-4 border-b border-neutral-200 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-noir-900">
                Active Filters
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:underline uppercase tracking-wider font-medium"
              >
                Reset All
              </button>
            </div>
          )}

          {/* 1. Category Filter */}
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
              {categories.map((cat) => (
                <button
                  key={cat.id || cat.slug}
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

          {/* 2. Size Filter */}
          <div className="pt-5 border-t border-neutral-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-noir-900">
                Size
              </h3>
              {selectedSize !== "all" && (
                <button
                  onClick={() => handleSizeChange("all")}
                  className="text-[10px] text-neutral-400 hover:text-rose-600 uppercase tracking-wider"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => handleSizeChange(sz)}
                  className={`py-1.5 text-xs uppercase tracking-wider border rounded-sm font-medium transition-all ${
                    selectedSize === sz
                      ? "bg-noir-900 text-white border-noir-900 shadow-sm"
                      : "bg-white text-noir-900 border-neutral-200 hover:border-noir-900"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Color Filter */}
          <div className="pt-5 border-t border-neutral-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-noir-900">
                Colour
              </h3>
              {selectedColor !== "all" && (
                <button
                  onClick={() => handleColorChange("all")}
                  className="text-[10px] text-neutral-400 hover:text-rose-600 uppercase tracking-wider"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {FILTER_COLORS.map((col) => (
                <button
                  key={col.name}
                  onClick={() => handleColorChange(col.name)}
                  className={`relative w-6 h-6 rounded-full border transition-all flex items-center justify-center ${
                    selectedColor.toLowerCase() === col.name.toLowerCase()
                      ? "ring-2 ring-noir-900 ring-offset-2 scale-110"
                      : "border-neutral-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                  aria-label={`Filter by ${col.name}`}
                >
                  {selectedColor.toLowerCase() === col.name.toLowerCase() && (
                    <Check
                      className={`w-3 h-3 ${
                        col.name === "White" || col.name === "Cream"
                          ? "text-black"
                          : "text-white"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Price Range Slider */}
          <div className="pt-5 border-t border-neutral-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-noir-900">
                Max Price
              </h3>
              <span className="text-xs font-bold text-noir-900">
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

          {/* 5. In-Stock Availability Toggle */}
          <div className="pt-5 border-t border-neutral-200">
            <label className="flex items-center space-x-2 text-xs text-noir-900 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-noir-900 w-4 h-4 rounded"
              />
              <span className="uppercase tracking-wider font-semibold text-[11px]">
                In-Stock Only
              </span>
            </label>
          </div>

          {/* Guarantee Pill */}
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-sm">
            <div className="flex items-center space-x-2 text-brand-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Velour Craft Guarantee</span>
            </div>
            <p className="text-[11px] text-brand-900 mt-1.5 leading-relaxed">
              Every garment includes luxury garment dustbags and comes with our 14-day doorstep exchange privilege.
            </p>
          </div>
        </aside>

        {/* Product Grid & Top Bar Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar: Mobile Filter Button + Active Chips + Sort */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-neutral-200 gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpenMobile(true)}
              className="lg:hidden flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-noir-900 px-3 py-2 border border-neutral-300 rounded-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters {hasActiveFilters && "(Active)"}</span>
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

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-[11px] uppercase tracking-wider text-neutral-400">
                Filtered by:
              </span>
              {selectedGender !== "all" && (
                <span className="inline-flex items-center px-2.5 py-1 bg-neutral-100 text-noir-900 text-xs rounded-sm uppercase tracking-wider">
                  Gender: {selectedGender}
                  <button onClick={() => handleGenderChange("all")} className="ml-1 text-neutral-500 hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center px-2.5 py-1 bg-neutral-100 text-noir-900 text-xs rounded-sm uppercase tracking-wider">
                  Category: {selectedCategory.replace("-", " ")}
                  <button onClick={() => handleCategoryChange("all")} className="ml-1 text-neutral-500 hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSize !== "all" && (
                <span className="inline-flex items-center px-2.5 py-1 bg-neutral-100 text-noir-900 text-xs rounded-sm uppercase tracking-wider">
                  Size: {selectedSize}
                  <button onClick={() => handleSizeChange("all")} className="ml-1 text-neutral-500 hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedColor !== "all" && (
                <span className="inline-flex items-center px-2.5 py-1 bg-neutral-100 text-noir-900 text-xs rounded-sm uppercase tracking-wider">
                  Colour: {selectedColor}
                  <button onClick={() => handleColorChange("all")} className="ml-1 text-neutral-500 hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {priceMax < 15000 && (
                <span className="inline-flex items-center px-2.5 py-1 bg-neutral-100 text-noir-900 text-xs rounded-sm uppercase tracking-wider">
                  Under ₹{priceMax.toLocaleString()}
                  <button onClick={() => setPriceMax(15000)} className="ml-1 text-neutral-500 hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center px-2.5 py-1 bg-neutral-100 text-noir-900 text-xs rounded-sm uppercase tracking-wider">
                  In-Stock Only
                  <button onClick={() => setInStockOnly(false)} className="ml-1 text-neutral-500 hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:underline uppercase tracking-wider font-semibold ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid Area with Loading, Error, and Empty States */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3 bg-white p-3 border border-[#EBE6DD]">
                  <div className="aspect-[3/4] bg-[#F1EDE5] w-full" />
                  <div className="h-3 bg-[#EBE6DD] w-3/4 rounded-sm" />
                  <div className="h-3 bg-[#EBE6DD] w-1/3 rounded-sm" />
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="text-center py-16 bg-[#F8F6F1] border border-[#EBE6DD] p-8 space-y-3 my-4">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-noir-900">
                Connection to Atelier Catalog Interrupted
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">{fetchError}</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={fetchCatalogData}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Retry Connection</span>
              </Button>
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              emptyMessage="No pieces match your selected combination of audience, category, size, colour, and price range. Try broadening your filter selection."
            />
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-out Drawer */}
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

            <div className="flex-1 overflow-y-auto py-5 space-y-6">
              {/* Audience */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-700 mb-2.5">
                  Audience & Department
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => handleGenderChange(g.value)}
                      className={`py-1.5 px-2 text-xs uppercase tracking-wider border rounded-sm ${
                        selectedGender === g.value
                          ? "bg-noir-900 text-white font-bold border-noir-900"
                          : "border-neutral-200 text-neutral-600"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="pt-4 border-t border-neutral-200">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-700 mb-2.5">
                  Categories
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className={`block text-xs uppercase tracking-wider text-left w-full ${
                      selectedCategory === "all" ? "font-bold text-noir-900" : "text-neutral-500"
                    }`}
                  >
                    All Garments
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id || c.slug}
                      onClick={() => handleCategoryChange(c.slug)}
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

              {/* Sizes */}
              <div className="pt-4 border-t border-neutral-200">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-700 mb-2.5">
                  Sizes ({selectedGender})
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleSizeChange(sz)}
                      className={`py-1.5 text-xs uppercase tracking-wider border rounded-sm font-medium ${
                        selectedSize === sz
                          ? "bg-noir-900 text-white border-noir-900"
                          : "border-neutral-200 text-noir-900"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colours */}
              <div className="pt-4 border-t border-neutral-200">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-700 mb-2.5">
                  Colours
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {FILTER_COLORS.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => handleColorChange(col.name)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        selectedColor.toLowerCase() === col.name.toLowerCase()
                          ? "ring-2 ring-noir-900 ring-offset-2 scale-110"
                          : "border-neutral-300"
                      }`}
                      style={{ backgroundColor: col.hex }}
                    >
                      {selectedColor.toLowerCase() === col.name.toLowerCase() && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Max */}
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

              {/* In-stock */}
              <div className="pt-4 border-t border-neutral-200">
                <label className="flex items-center space-x-2 text-xs text-noir-900">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-noir-900 w-4 h-4 rounded"
                  />
                  <span className="uppercase tracking-wider font-semibold">
                    In-Stock Only
                  </span>
                </label>
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
