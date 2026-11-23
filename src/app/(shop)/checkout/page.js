"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, shippingFee, tax, total, clearCart } = useCart();

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: session?.user?.name || "Aria Thorne",
    phone: "+91 98765 43210",
    street: "Flat 4B, Silver Oak Heights, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560038",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-600">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wide text-noir-900">
          No Items in Bag for Checkout
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Please add clothing pieces to your shopping bag before proceeding to checkout.
        </p>
        <div className="pt-4">
          <Button href="/shop" variant="primary" size="lg">
            Explore Wardrobe
          </Button>
        </div>
      </div>
    );
  }

  // Handle Checkout submission
  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // 1. Create order on server (price calculation & Razorpay order creation)
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress,
          paymentMethod,
          userId: session?.user?.id,
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize order");
      }

      const { orderNumber, dbOrderId, razorpayOrderId, amount, currency, key, isMock } =
        orderData;

      // 2. If Mock Payment is enabled or simulated mode
      if (isMock || !window.Razorpay) {
        // Simulate gateway verification
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: "mock_signature_success",
            orderNumber,
            dbOrderId,
            isMock: true,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          clearCart();
          router.push(`/order-success/${orderNumber}`);
        } else {
          throw new Error(verifyData.error || "Payment verification failed");
        }
        return;
      }

      // 3. Real Razorpay SDK Trigger
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "VELOUR Atelier",
        description: `Order ${orderNumber} - Fine Contemporary Apparel`,
        image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=200",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderNumber,
                dbOrderId,
                isMock: false,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              router.push(`/order-success/${orderNumber}`);
            } else {
              setErrorMessage("Payment signature verification failed. Please contact support.");
              setIsProcessing(false);
            }
          } catch (err) {
            setErrorMessage("Error verifying payment transaction.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: session?.user?.email || "concierge@velour.com",
          contact: shippingAddress.phone || "",
        },
        theme: {
          color: "#0A0A0A",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setErrorMessage(resp.error.description || "Payment failed or was cancelled.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage(err.message || "An error occurred during payment processing.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Load Razorpay script using Next.js Script component */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Header */}
      <div className="pb-8 border-b border-neutral-200">
        <span className="text-[11px] uppercase tracking-ultra text-brand-600 font-semibold">
          Secure Atelier Checkout
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-noir-900 mt-1">
          Express Courier & Payment
        </h1>
      </div>

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-7 space-y-8">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-sm">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Shipping Address */}
          <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-neutral-100">
              <Truck className="w-4 h-4 text-brand-600" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-noir-900">
                1. Delivery Destination
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={shippingAddress.fullName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                }
              />
              <Input
                label="Mobile Phone"
                type="tel"
                required
                value={shippingAddress.phone}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, phone: e.target.value })
                }
              />
            </div>

            <Input
              label="Street Address / Suite"
              required
              value={shippingAddress.street}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, street: e.target.value })
              }
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                required
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
              />
              <Input
                label="State"
                required
                value={shippingAddress.state}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, state: e.target.value })
                }
              />
              <Input
                label="Postal PIN"
                required
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                }
              />
            </div>
          </div>

          {/* Section 2: Payment Gateway Selection */}
          <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-neutral-100">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-noir-900">
                2. Payment Method
              </h2>
            </div>

            <div className="space-y-3">
              {/* Razorpay Online */}
              <label
                className={`flex items-start p-4 border rounded-sm cursor-pointer transition-all ${
                  paymentMethod === "RAZORPAY"
                    ? "border-noir-900 bg-neutral-50/70"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="mt-0.5 accent-noir-900"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-noir-900">
                      Razorpay Secure Payment
                    </span>
                    <span className="text-[10px] bg-brand-100 text-brand-800 px-2 py-0.5 rounded font-semibold uppercase">
                      Instant
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard), NetBanking, and EMI.
                  </p>
                </div>
              </label>

              {/* Cash on Delivery option */}
              <label
                className={`flex items-start p-4 border rounded-sm cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-noir-900 bg-neutral-50/70"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-0.5 accent-noir-900"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-noir-900">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Pay securely in cash or UPI upon home courier delivery.
                  </p>
                </div>
              </label>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-sm flex items-center space-x-2 text-[11px] text-brand-900">
              <ShieldCheck className="w-4 h-4 text-brand-700 flex-shrink-0" />
              <span>
                Encrypted via 256-bit SSL and authenticated by Razorpay with HMAC SHA-256 verification.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Total Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-sm space-y-6 sticky top-28">
            <h2 className="text-xs font-bold uppercase tracking-widest text-noir-900 border-b border-neutral-100 pb-3">
              Order Review ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h2>

            {/* Items scroll list */}
            <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100 pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 flex items-center space-x-3">
                  <div className="relative w-12 h-16 bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="60px"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-noir-900 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Size: {item.selectedSize} | Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-noir-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 text-xs text-neutral-600 border-t border-neutral-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-noir-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Courier Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-medium">Complimentary</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (12%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between text-base font-bold text-noir-900">
                <span>Total Amount</span>
                <span className="font-serif">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isProcessing}
              className="w-full tracking-widest"
            >
              <Lock className="w-4 h-4 mr-2" />
              <span>Pay {formatPrice(total)} & Confirm Order</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
