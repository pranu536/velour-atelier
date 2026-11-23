"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Printer, Sparkles } from "lucide-react";
import Button from "@/components/common/Button";

export default function OrderSuccessPage({ params: propParams }) {
  const routeParams = useParams();
  const id =
    routeParams?.id ||
    (propParams && typeof propParams.then !== "function" ? propParams.id : "VEL-ORDER");

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8 animate-fade-in">
      {/* Icon Badge */}
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm border border-emerald-100">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase tracking-ultra text-emerald-700 font-semibold">
          Order Confirmed & Payment Verified
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-noir-900">
          Thank You For Your Patronage
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
          Your order has been recorded in our atelier dispatch system. Our tailors will prepare and hand-inspect your garments.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-brand-50 border border-brand-200 p-6 rounded-sm text-left max-w-lg mx-auto space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-500 uppercase tracking-wider">Order Reference:</span>
          <span className="font-mono font-bold text-noir-900 text-sm">{id}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-500 uppercase tracking-wider">Payment Status:</span>
          <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[11px]">
            ✓ PAID via Razorpay
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-500 uppercase tracking-wider">Estimated Dispatch:</span>
          <span className="text-noir-900 font-medium">Within 24 Hours</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button href="/orders" variant="primary" size="lg" className="flex items-center space-x-2">
          <Package className="w-4 h-4 mr-2" />
          <span>Track Order Status</span>
        </Button>
        <Button href="/shop" variant="outline" size="lg" className="flex items-center space-x-2">
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Printing receipt */}
      <div className="pt-6">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center text-xs text-neutral-400 hover:text-noir-900 transition-colors uppercase tracking-wider"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          <span>Print Receipt Invoice</span>
        </button>
      </div>
    </div>
  );
}

