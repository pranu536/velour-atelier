"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Printer,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/common/Button";
import { formatPrice } from "@/lib/utils";

export default function OrderSuccessPage({ params: propParams }) {
  const routeParams = useParams();
  const rawId =
    routeParams?.id ||
    (propParams && typeof propParams.then !== "function" ? propParams.id : null);
  const id = Array.isArray(rawId) ? rawId[0] : rawId || "VEL-ORDER";

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id || id === "VEL-ORDER") {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchOrder() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          throw new Error("Unable to fetch order details.");
        }
        const data = await res.json();
        if (isMounted && data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(err.message || "Failed to load order.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-10 animate-fade-in text-noir-900">
      {/* Top Banner & Status Icon */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto text-[#242424] shadow-sm border border-brand-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-ultra text-brand-700 font-semibold">
            {order?.paymentStatus === "PAID"
              ? "Order Confirmed & Payment Verified"
              : order?.paymentStatus === "FAILED"
              ? "Order Payment Failed"
              : "Order Registered & Payment Pending"}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-noir-900">
            {order?.paymentStatus === "PAID"
              ? "Thank You For Your Patronage"
              : order?.paymentStatus === "FAILED"
              ? "Payment Requires Attention"
              : "Thank You For Your Order"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            {order?.paymentStatus === "PAID"
              ? "Your payment has been cryptographically confirmed via Razorpay. Our tailors will prepare and hand-inspect your garments."
              : order?.paymentStatus === "FAILED"
              ? "The payment transaction could not be completed. You can re-attempt payment with your saved bag."
              : "Your pending order record has been registered in our atelier system. Payment remains pending until gateway confirmation."}
          </p>
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="bg-brand-50 border border-brand-200 rounded-sm p-6 sm:p-8 space-y-6">
        {/* Reference and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-brand-200">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
              Order Reference
            </span>
            <span className="font-mono font-bold text-noir-900 text-base">
              {order?.orderNumber || id}
            </span>
            {order?.razorpayPaymentId && (
              <span className="block text-[11px] text-neutral-500 font-mono mt-0.5">
                Ref: {order.razorpayPaymentId}
              </span>
            )}
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
              Payment Status
            </span>
            {order?.paymentStatus === "PAID" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ✓ PAID via Razorpay
              </span>
            ) : order?.paymentStatus === "FAILED" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-sm bg-rose-50 text-rose-800 border border-rose-200">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                ⚠ PAYMENT FAILED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-sm bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3" />
                PENDING (GATEWAY PENDING)
              </span>
            )}
          </div>
        </div>

        {/* Order Items List */}
        {order?.items && order.items.length > 0 && (
          <div className="space-y-3 pb-6 border-b border-brand-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Garments Ordered ({order.items.reduce((s, i) => s + (i.quantity || 1), 0)})
            </h3>
            <div className="divide-y divide-brand-200/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-serif font-bold text-noir-900 tracking-tight">
                      {item.name}
                    </p>
                    <p className="text-neutral-500 text-[11px]">
                      Size: {item.size || "Standard"} &bull; Colour: {item.color || "Original"} &bull; Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right font-mono font-medium text-noir-900">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Address & Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Shipping Address */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-neutral-600 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              Delivery Destination
            </h4>
            {order?.shippingAddress ? (
              <div className="text-neutral-600 leading-relaxed font-sans space-y-0.5">
                <p className="font-medium text-noir-900">{order.shippingAddress.fullName}</p>
                {order.shippingAddress.houseNumber && (
                  <p>{order.shippingAddress.houseNumber}, {order.shippingAddress.street}</p>
                )}
                {!order.shippingAddress.houseNumber && <p>{order.shippingAddress.street}</p>}
                {order.shippingAddress.landmark && <p>Near: {order.shippingAddress.landmark}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </p>
                <p className="text-[11px] text-neutral-500 pt-1">Phone: {order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-neutral-400 italic">Saved Delivery Address</p>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 border-t sm:border-t-0 sm:border-l sm:pl-6 border-brand-200 pt-4 sm:pt-0">
            <h4 className="font-semibold uppercase tracking-wider text-neutral-600 mb-2">
              Payment Summary
            </h4>
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal:</span>
              <span className="font-mono text-noir-900">
                {order ? formatPrice(order.subtotal) : "--"}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Shipping:</span>
              <span className="font-mono text-noir-900">
                {order ? (order.shippingFee === 0 ? "FREE" : formatPrice(order.shippingFee)) : "--"}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>GST (12%):</span>
              <span className="font-mono text-noir-900">
                {order ? formatPrice(order.tax) : "--"}
              </span>
            </div>
            <div className="flex justify-between font-serif font-bold text-sm text-noir-900 pt-2 border-t border-brand-200">
              <span>Total Amount:</span>
              <span className="font-mono font-bold text-base">
                {order ? formatPrice(order.totalAmount) : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Information Notice */}
        <div className="bg-brand-100/60 p-3 rounded-sm flex items-start gap-2.5 text-[11px] text-neutral-600">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <p>
            Order registered with unique idempotency protection. Ready for Razorpay payment gateway integration.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        {order?.paymentStatus === "FAILED" ? (
          <Button href="/checkout" variant="primary" size="lg" className="flex items-center space-x-2 bg-rose-700 hover:bg-rose-800 border-none text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            <span>Retry Payment</span>
          </Button>
        ) : (
          <Button href="/orders" variant="primary" size="lg" className="flex items-center space-x-2">
            <Package className="w-4 h-4 mr-2" />
            <span>Track Order Status</span>
          </Button>
        )}
        <Button href="/shop" variant="outline" size="lg" className="flex items-center space-x-2">
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Printing receipt */}
      <div className="pt-2 text-center">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center text-xs text-neutral-400 hover:text-noir-900 transition-colors uppercase tracking-wider"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          <span>Print Order Summary</span>
        </button>
      </div>
    </div>
  );
}
