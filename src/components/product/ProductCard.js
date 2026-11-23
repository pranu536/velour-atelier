"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Check } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Badge from "@/components/common/Badge";

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeImage, setActiveImage] = useState(product.images?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [addedNotice, setAddedNotice] = useState(false);

  const productId = product.id || product.slug;
  const isFavorited = isInWishlist(productId);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const primaryImage = activeImage || product.images?.[0] || "";
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || "M";
    addToCart(product, {
      size: defaultSize,
      color: selectedColor || product.colors?.[0] || { name: "Standard" },
      quantity: 1,
    });
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1600);
  };

  const handleColorHover = (color) => {
    setSelectedColor(color);
    if (color.image) {
      setActiveImage(color.image);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white border border-[#EBE6DD] transition-all duration-300 hover:border-[#D8CDBD] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      {/* Visual Image Container with Minimal Hover Presentation */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F8F6F1] block">
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
              className="object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Optional alternate look on hover when secondary exists and no custom color selected */}
          {secondaryImage && !selectedColor?.image && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              className="object-cover object-top transition-opacity duration-500 opacity-0 group-hover:opacity-100"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1.5 z-10 pointer-events-none">
          {product.isBestseller && (
            <Badge variant="bestseller" size="sm">
              Bestseller
            </Badge>
          )}
          {product.isNewArrival && !product.isBestseller && (
            <Badge variant="new" size="sm">
              New Arrival
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="sale" size="sm">
              Save {discount}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="danger" size="sm">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 transition-all duration-200 z-10 ${
            isFavorited
              ? "bg-[#242424] text-white"
              : "bg-white/90 hover:bg-white text-[#242424] border border-[#E5DFD6] opacity-0 group-hover:opacity-100 focus:opacity-100"
          }`}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-white text-white" : ""}`} />
        </button>

        {/* Quick Add Bar */}
        {product.inStock && (
          <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/40 via-black/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center z-10">
            <button
              onClick={handleQuickAdd}
              className={`w-full py-2.5 px-3 text-[11px] uppercase tracking-widest font-medium transition-all duration-200 shadow-sm flex items-center justify-center space-x-1.5 ${
                addedNotice
                  ? "bg-[#242424] text-white"
                  : "bg-white hover:bg-[#242424] hover:text-white text-[#242424]"
              }`}
            >
              {addedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Subtle Audience & Category Tag */}
          <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
            <span>{product.gender}</span>
            <span>{product.category?.name || "Apparel"}</span>
          </div>

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="text-xs font-medium tracking-wide text-[#242424] hover:text-neutral-500 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#F1EDE5] flex items-center justify-between">
          {/* Price & Discount */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#242424]">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[11px] text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center space-x-1">
              {product.colors.slice(0, 4).map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleColorHover(c)}
                  onMouseEnter={() => handleColorHover(c)}
                  className={`w-2.5 h-2.5 rounded-full border transition-transform ${
                    selectedColor?.name === c.name
                      ? "ring-1 ring-[#242424] ring-offset-1 scale-110 border-transparent"
                      : "border-neutral-300 hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hexCode }}
                  title={c.name}
                  aria-label={`Select ${c.name} color`}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[9px] text-neutral-400 pl-0.5">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
