"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shippingFee,
    tax,
    total,
    freeShippingRemaining,
    freeShippingProgress,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState(null);

  const applyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "VELOUR10" || code === "WELCOME10") {
      const discount = Math.round(subtotal * 0.1);
      setPromoDiscount(discount);
      setPromoMessage({ type: "success", text: "10% Maison Privilège Applied!" });
    } else if (code) {
      setPromoDiscount(0);
      setPromoMessage({ type: "error", text: "Invalid or expired promotional voucher." });
    }
  };

  const finalTotal = Math.max(0, total - promoDiscount);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-600">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wide text-noir-900">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Explore our autumn/winter tailoring, heavyweight loopback hoodies, and minimalist essentials.
        </p>
        <div className="pt-4">
          <Button variant="primary" size="lg">
            <Link href="/shop" className="flex items-center space-x-2">
              <span>Explore The Collection</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title & Back */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tight text-noir-900">
            Shopping Bag
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">
            {items.reduce((s, i) => s + i.quantity, 0)} Items Selected
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center text-xs uppercase tracking-wider text-neutral-600 hover:text-noir-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          <span>Continue Browsing</span>
        </Link>
      </div>

      {/* Free Shipping Notification */}
      <div className="mt-6 bg-brand-50 p-4 border border-brand-200 rounded-sm">
        <div className="flex justify-between text-xs text-brand-900 font-medium mb-1.5">
          <span>
            {freeShippingRemaining > 0
              ? `Add ${formatPrice(freeShippingRemaining)} more to qualify for Complimentary Global Courier`
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

      {/* Main Grid: Bag Items (Left) + Order Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
        {/* Left: Cart Items Table/List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
            {items.map((item, idx) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor?.name}-${idx}`}
                className="py-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-start sm:items-center justify-between"
              >
                {/* Image & Title */}
                <div className="flex space-x-4 items-center">
                  <div className="relative w-20 h-28 bg-neutral-100 flex-shrink-0 overflow-hidden rounded-sm">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="100px"
                      />
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-noir-900 hover:text-brand-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-neutral-500 mt-1 space-x-2">
                      <span>Size: {item.selectedSize}</span>
                      {item.selectedColor && (
                        <span>| Color: {item.selectedColor.name}</span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-noir-900 mt-2">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </div>

                {/* Stepper + Line Total + Remove */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                  {/* Stepper */}
                  <div className="flex items-center border border-neutral-300 rounded-sm">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.selectedSize,
                          item.selectedColor?.name,
                          item.quantity - 1
                        )
                      }
                      className="p-1.5 hover:bg-neutral-100 text-neutral-600"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-semibold text-noir-900">
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
                      className="p-1.5 hover:bg-neutral-100 text-neutral-600"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="text-sm font-bold text-noir-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() =>
                      removeFromCart(item.id, item.selectedSize, item.selectedColor?.name)
                    }
                    className="p-2 text-neutral-400 hover:text-rose-600 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={clearCart}
              className="text-xs text-neutral-400 hover:text-rose-600 transition-colors uppercase tracking-wider"
            >
              Empty Shopping Bag
            </button>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-sm space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-noir-900 border-b border-neutral-100 pb-3">
              Order Summary
            </h2>

            {/* Calculations */}
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-noir-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[11px]">
                      Complimentary
                    </span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (12%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Privilege Voucher</span>
                  <span>-{formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-3 flex justify-between text-sm font-bold text-noir-900">
                <span>Estimated Total</span>
                <span className="font-serif text-base">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={applyPromo} className="pt-2 border-t border-neutral-100 space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Promo code (e.g. VELOUR10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-sm uppercase tracking-wider focus:outline-none focus:border-noir-900"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Apply
                </Button>
              </div>
              {promoMessage && (
                <p
                  className={`text-xs ${
                    promoMessage.type === "success" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
            </form>

            {/* Checkout Action Button */}
            <div className="pt-2">
              <Button variant="primary" size="lg" className="w-full">
                <Link href="/checkout" className="flex items-center justify-center">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Guarantees */}
            <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400 space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>PCI-DSS 256-Bit SSL Encrypted Checkout</span>
              </div>
              <p>Complimentary 14-day exchange privilege with door pickup.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
