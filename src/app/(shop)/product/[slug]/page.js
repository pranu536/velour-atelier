"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Truck,
  RefreshCw,
  ShieldCheck,
  Check,
  Star,
  ChevronRight,
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/lib/seed-data";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import ProductGrid from "@/components/product/ProductGrid";

export default function ProductDetailPage({ params }) {
  const { slug } = params;

  // Locate product from catalog
  const product = INITIAL_PRODUCTS.find((p) => p.slug === slug);
  if (!product) {
    notFound();
  }

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Component state
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "M");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Reset variant selections when navigating between products
  useEffect(() => {
    if (product) {
      setSelectedImage(product.images?.[0] || "");
      setSelectedSize(product.sizes?.[0] || "M");
      setSelectedColor(product.colors?.[0] || null);
      setQuantity(1);
    }
  }, [slug]);

  const productId = product.id || product.slug;
  const isFavorited = isInWishlist(productId);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  // Recommendations: Other products from same category or gender
  const relatedProducts = INITIAL_PRODUCTS.filter(
    (p) => p.slug !== product.slug && (p.categorySlug === product.categorySlug || p.gender === product.gender)
  ).slice(0, 4);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    if (color.image) {
      setSelectedImage(color.image);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 mb-8">
        <Link href="/" className="hover:text-noir-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-noir-900 transition-colors">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop?category=${product.categorySlug}`}
          className="hover:text-noir-900 transition-colors"
        >
          {product.category?.name || product.categorySlug.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-noir-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Image Gallery (Thumbs + Big View) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[650px] scrollbar-none">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 bg-neutral-100 overflow-hidden rounded-sm border-2 transition-all ${
                  selectedImage === img
                    ? "border-noir-900 opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover object-top"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          {/* Main Featured Image */}
          <div className="relative flex-1 aspect-[3/4] bg-neutral-100 overflow-hidden rounded-sm">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                className="object-cover object-top transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            )}
            {/* Wishlist floating toggle */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full transition-all shadow-md ${
                isFavorited
                  ? "bg-rose-50 text-rose-600"
                  : "bg-white/90 hover:bg-white text-noir-900"
              }`}
              aria-label="Save to wishlist"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-rose-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category, Gender, Rating */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
                {product.gender} Atelier Edition
              </span>
              <div className="flex items-center space-x-1 text-amber-500 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-noir-900">{product.rating}</span>
                <span className="text-neutral-400">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-tight text-noir-900">
              {product.name}
            </h1>

            {/* Price & Discount */}
            <div className="flex items-baseline space-x-3 pt-1">
              <span className="text-2xl font-bold text-noir-900">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <Badge variant="sale" size="sm">
                    Save {discount}%
                  </Badge>
                </>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">Taxes included. Complimentary courier shipping on this order.</p>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs uppercase tracking-widest font-semibold text-noir-900">
                    Color: <span className="font-normal text-neutral-600">{selectedColor?.name}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {product.colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => handleColorSelect(color)}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        selectedColor?.name === color.name
                          ? "ring-2 ring-noir-900 ring-offset-2 scale-105"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                      aria-label={`Select color ${color.name}`}
                    >
                      {selectedColor?.name === color.name && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            color.hexCode === "#FFFFFF" || color.hexCode === "#E8E5DD"
                              ? "text-black"
                              : "text-white"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs uppercase tracking-widest font-semibold text-noir-900">
                    Select Size
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400">
                    Standard Atelier Fit
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-xs uppercase tracking-wider font-medium border rounded-sm transition-all ${
                        selectedSize === size
                          ? "bg-noir-900 text-white border-noir-900 shadow-sm"
                          : "bg-white text-noir-900 border-neutral-200 hover:border-noir-900"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart Action */}
            <div className="pt-4 space-y-3">
              <div className="flex space-x-3">
                {/* Quantity stepper */}
                <div className="flex items-center border border-neutral-300 rounded-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-3 text-neutral-600 hover:bg-neutral-100 text-xs font-semibold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold text-noir-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-3 text-neutral-600 hover:bg-neutral-100 text-xs font-semibold"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add To Bag Primary Button */}
                <Button
                  onClick={handleAddToCart}
                  variant="primary"
                  size="lg"
                  className="flex-1 tracking-widest"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span>{isAddedFeedback ? "Added to Bag ✓" : "Add to Shopping Bag"}</span>
                </Button>
              </div>

              {/* Wishlist Full Width Outline Button */}
              <Button
                onClick={() => toggleWishlist(product)}
                variant="outline"
                size="md"
                className="w-full"
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-rose-600 text-rose-600" : ""}`} />
                <span>{isFavorited ? "Saved in Wishlist" : "Save to Wishlist"}</span>
              </Button>
            </div>

            {/* Inventory Status */}
            <div className="pt-2 text-xs flex items-center space-x-2 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>In Stock — Dispatched within 24 hours</span>
            </div>
          </div>

          {/* Garment Details & Architectural Specs Accordion */}
          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-noir-900 mb-2">
                Garment Specifications
              </h3>
              <ul className="space-y-1.5 text-xs text-neutral-600 list-disc list-inside">
                {product.details?.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>

            {/* Maison Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 text-center text-[10px] text-neutral-500 uppercase tracking-wider">
              <div className="p-2 bg-neutral-50 rounded">
                <Truck className="w-4 h-4 mx-auto mb-1 text-brand-600" />
                <span>Complimentary Courier</span>
              </div>
              <div className="p-2 bg-neutral-50 rounded">
                <RefreshCw className="w-4 h-4 mx-auto mb-1 text-brand-600" />
                <span>14-Day Exchanges</span>
              </div>
              <div className="p-2 bg-neutral-50 rounded">
                <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-brand-600" />
                <span>PCI-DSS Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide text-noir-900">
              Complete The Lookbook
            </h2>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-wider font-semibold text-brand-700 hover:text-noir-900 transition-colors"
            >
              Explore All Garments &rarr;
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
