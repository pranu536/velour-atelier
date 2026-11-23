"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/common/Button";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingRemaining,
    freeShippingProgress,
  } = useCart();

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-noir-900" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-noir-900">
                Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-noir-900 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-brand-50 p-4 border-b border-brand-100">
            <div className="flex justify-between text-xs text-brand-900 font-medium mb-1.5">
              <span>
                {freeShippingRemaining > 0
                  ? `Add ${formatPrice(freeShippingRemaining)} more for Complimentary Shipping`
                  : "✓ You have unlocked Complimentary Express Shipping!"}
              </span>
              <span>{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-brand-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-1.5 transition-all duration-300 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="p-4 bg-brand-50 rounded-full text-brand-500">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-noir-900">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                    Discover new tailored arrivals and timeless essentials crafted for the modern wardrobe.
                  </p>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="primary"
                  size="md"
                  className="mt-2"
                >
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor?.name}-${idx}`} className="pt-4 first:pt-0 flex space-x-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 bg-neutral-100 flex-shrink-0 overflow-hidden rounded-sm">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="80px"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.selectedSize, item.selectedColor?.name)
                          }
                          className="text-neutral-400 hover:text-rose-600 transition-colors ml-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-1 space-x-2">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && (
                          <span>| Color: {item.selectedColor.name}</span>
                        )}
                      </div>

                      <div className="text-xs font-medium text-noir-900 mt-1">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-3 mt-3">
                      <div className="flex items-center border border-neutral-200 rounded-sm">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.selectedSize,
                              item.selectedColor?.name,
                              item.quantity - 1
                            )
                          }
                          className="p-1 hover:bg-neutral-100 text-neutral-600"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-noir-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.selectedSize,
                              item.selectedColor?.name,
                              item.quantity + 1
                            )
                          }
                          className="p-1 hover:bg-neutral-100 text-neutral-600"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-noir-900 ml-auto">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-100 bg-neutral-50/50 space-y-3">
              <div className="flex justify-between text-xs text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-noir-900">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Taxes and shipping calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  size="md"
                  className="w-full"
                >
                  <Link href="/cart">View Bag</Link>
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  <Link href="/checkout" className="flex items-center justify-center">
                    <span>Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
