"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/common/Button";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = (product) => {
    addToCart(product, {
      size: "M",
      color: { name: "Default" },
      quantity: 1,
    });
    removeFromWishlist(product.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wide text-noir-900">
          Your Wishlist is Empty
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Save your favourite architectural cuts, tailored coats, and luxury silhouettes for future styling.
        </p>
        <div className="pt-4">
          <Button href="/shop" variant="primary" size="lg" className="inline-flex items-center space-x-2">
            <span>Explore Wardrobe</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="pb-8 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-noir-900">
            Saved Wardrobe Wishlist
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">
            {wishlistItems.length} {wishlistItems.length === 1 ? "Piece" : "Pieces"} Saved
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-wider font-semibold text-brand-700 hover:text-noir-900 transition-colors mt-3 sm:mt-0"
        >
          Continue Shopping &rarr;
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-8">
        {wishlistItems.map((product) => (
          <div
            key={product.id}
            className="group relative flex flex-col bg-white border border-neutral-100 rounded-sm overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 block">
              <Link
                href={`/product/${product.slug}`}
                className="absolute inset-0 z-0 block"
              >
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromWishlist(product.id);
                }}
                className="absolute top-2.5 right-2.5 p-2 bg-white/80 hover:bg-white text-rose-600 rounded-full shadow-sm z-10"
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Info */}
            <div className="p-3.5 flex flex-col flex-1 justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                  {product.category || "Apparel"}
                </span>
                <Link
                  href={`/product/${product.slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors mt-1 block line-clamp-1"
                >
                  {product.name}
                </Link>
                <div className="text-xs font-bold text-noir-900 mt-1.5">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 mt-2 border-t border-neutral-100">
                <Button
                  onClick={() => handleMoveToBag(product)}
                  variant="primary"
                  size="sm"
                  className="w-full flex items-center justify-center"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                  <span>Move to Bag</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
