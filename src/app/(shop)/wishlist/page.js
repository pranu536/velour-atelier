"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowRight, Check } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoaded } = useWishlist();
  const { addToCart } = useCart();
  const [addedNoticeId, setAddedNoticeId] = useState(null);

  const handleAddToCart = (product) => {
    if (product.inStock === false) return;

    const defaultSize = product.sizes?.[0] || "Standard";
    const defaultColor = product.colors?.[0] || { name: "Standard" };

    const res = addToCart(product, {
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
    });

    if (res?.success) {
      setAddedNoticeId(product.id);
      setTimeout(() => setAddedNoticeId(null), 1600);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#242424] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400">Loading your saved wardrobe...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-[#F8F6F1] border border-[#EBE6DD] rounded-full flex items-center justify-center mx-auto text-[#242424]">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wide text-noir-900">
          Your Wishlist is Empty
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Save your favourite architectural silhouettes, tailored coats, and luxury essentials for future curation.
        </p>
        <div className="pt-4">
          <Button href="/shop" variant="primary" size="lg" className="inline-flex items-center space-x-2">
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="pb-8 border-b border-[#EBE6DD] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#242424]">
            Saved Wardrobe Wishlist
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">
            {wishlistItems.length} {wishlistItems.length === 1 ? "Piece" : "Pieces"} Curated
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-wider font-semibold text-[#7F6650] hover:text-[#242424] transition-colors inline-flex items-center"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-8">
        {wishlistItems.map((product) => {
          const isAdded = addedNoticeId === product.id;
          const isInStock = product.inStock !== false;

          return (
            <div
              key={product.id}
              className="group relative flex flex-col bg-white border border-[#EBE6DD] transition-all duration-300 hover:border-[#D8CDBD] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
            >
              {/* Product Visual Image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F8F6F1] block">
                <Link
                  href={`/product/${product.slug}`}
                  className="absolute inset-0 z-0 block"
                  aria-label={`View ${product.name}`}
                >
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  )}
                </Link>

                {/* Remove from Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWishlist(product.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-neutral-500 hover:text-rose-600 border border-[#E5DFD6] transition-colors shadow-sm z-10"
                  title="Remove from Wishlist"
                  aria-label={`Remove ${product.name} from wishlist`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Availability Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1.5 z-10 pointer-events-none">
                  {!isInStock ? (
                    <Badge variant="danger" size="sm">
                      Sold Out
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      In Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Details & Actions */}
              <div className="p-4 flex flex-col flex-1 justify-between bg-white space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
                    <span>{product.category?.name || product.category || "Apparel"}</span>
                    <span className={isInStock ? "text-emerald-700 font-medium" : "text-rose-600 font-medium"}>
                      {isInStock ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    className="text-xs font-semibold uppercase tracking-wider text-[#242424] hover:text-[#7F6650] transition-colors block line-clamp-1"
                  >
                    {product.name}
                  </Link>

                  <div className="text-xs font-semibold text-[#242424] mt-1.5">
                    {formatPrice(product.price)}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-[11px] text-neutral-400 line-through ml-2 font-normal">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Add to Bag & Remove */}
                <div className="pt-3 border-t border-[#F1EDE5] space-y-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    variant="primary"
                    size="sm"
                    disabled={!isInStock}
                    className="w-full flex items-center justify-center text-center uppercase tracking-wider text-[11px]"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                        <span>Added to Bag</span>
                      </>
                    ) : !isInStock ? (
                      <span>Sold Out</span>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </Button>

                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="w-full text-center text-[10px] uppercase tracking-wider text-neutral-400 hover:text-rose-600 transition-colors py-1"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
