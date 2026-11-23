"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Badge from "@/components/common/Badge";

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const productId = product.id || product.slug;
  const isFavorited = isInWishlist(productId);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const primaryImage = product.images?.[0] || "";
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || "M";
    const defaultColor = product.colors?.[0] || { name: "Default" };
    addToCart(product, { size: defaultSize, color: defaultColor, quantity: 1 });
  };

  return (
    <div className="group relative flex flex-col bg-white">
      {/* Visual Image Container with Hover Flip */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 block">
        {/* Full Image Link */}
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-0 block"
          aria-label={`View ${product.name}`}
        >
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover object-top transition-opacity duration-500 group-hover:opacity-0"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              className="object-cover object-top transition-transform duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1 z-10 pointer-events-none">
          {product.isNewArrival && (
            <Badge variant="new" size="sm">
              New Drop
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="sale" size="sm">
              -{discount}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="danger" size="sm">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Wishlist Button - Sibling to Link, preventing invalid DOM nesting */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 z-10 ${
            isFavorited
              ? "bg-rose-50 text-rose-600 shadow-md"
              : "bg-white/80 hover:bg-white text-noir-800 backdrop-blur-sm opacity-90 group-hover:opacity-100"
          }`}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-600" : ""}`} />
        </button>

        {/* Quick Add To Bag Bar - Sibling to Link */}
        {product.inStock && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden sm:flex justify-center z-10">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-white hover:bg-noir-900 hover:text-white text-noir-900 font-medium py-2.5 text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center space-x-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Quick Add to Bag</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-3 pb-2 flex flex-col flex-1">
        {/* Category & Gender */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 uppercase tracking-widest">
          <span>{product.gender}</span>
          <span>{product.category?.name || "Apparel"}</span>
        </div>

        {/* Title */}
        <Link
          href={`/product/${product.slug}`}
          className="text-xs font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors mt-1 line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-1.5 mt-2">
            {product.colors.map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                style={{ backgroundColor: c.hexCode }}
                title={c.name}
              />
            ))}
            <span className="text-[10px] text-neutral-400 pl-1">
              {product.colors.length} {product.colors.length === 1 ? "shade" : "shades"}
            </span>
          </div>
        )}

        {/* Price & Discount */}
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs font-bold text-noir-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
