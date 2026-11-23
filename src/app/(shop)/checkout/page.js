"use client";

import { useState, useEffect, useCallback, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  Truck,
  Lock,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Check,
  Plus,
  AlertCircle,
  Building,
  X,
  CreditCard,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Badge from "@/components/common/Badge";
import { INDIAN_STATES, validateAddress } from "@/lib/addressValidation";

const INITIAL_NEW_ADDRESS = {
  fullName: "",
  phone: "",
  houseNumber: "",
  street: "",
  landmark: "",
  city: "",
  state: "Maharashtra",
  postalCode: "",
  country: "India",
  isDefault: false,
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, shippingFee, tax, total, clearCart } = useCart();

  // Generate unique idempotency key once per checkout session
  const [idempotencyKey] = useState(
    () => `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );

  // Address state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [activeShippingAddress, setActiveShippingAddress] = useState(null);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);

  // New Address inline modal state
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState(INITIAL_NEW_ADDRESS);
  const [addressFormErrors, setAddressFormErrors] = useState({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Submission & Payment Gateway state
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [pendingOrder, setPendingOrder] = useState(null);
  const [paymentFailureState, setPaymentFailureState] = useState(null);
  const [isTestCheckoutModalOpen, setIsTestCheckoutModalOpen] = useState(false);

  // Fetch customer saved addresses from MongoDB Atlas
  const fetchAddresses = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setIsAddressesLoading(true);
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.addresses)) {
          setSavedAddresses(data.addresses);
          if (data.addresses.length > 0) {
            // Pre-select default address or first address
            const defaultAddr =
              data.addresses.find((a) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setActiveShippingAddress(defaultAddr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load saved addresses:", err);
    } finally {
      setIsAddressesLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status, fetchAddresses]);

  // Handle address selection
  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setActiveShippingAddress(addr);
    setErrorMessage("");
  };

  // Handle New Address Form inputs
  const handleAddressInputChange = (field, value) => {
    setNewAddressForm((prev) => ({ ...prev, [field]: value }));
    if (addressFormErrors[field]) {
      setAddressFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Submit New Address from within Checkout
  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    const { isValid, errors, sanitized } = validateAddress(newAddressForm);
    if (!isValid) {
      setAddressFormErrors(errors);
      return;
    }

    try {
      setIsSavingAddress(true);
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to save delivery address.");
        return;
      }

      // Update saved addresses list and select the newly added address
      setSavedAddresses(data.addresses);
      if (data.address) {
        setSelectedAddressId(data.address.id);
        setActiveShippingAddress(data.address);
      }
      setIsAddAddressModalOpen(false);
      setNewAddressForm(INITIAL_NEW_ADDRESS);
      setAddressFormErrors({});
    } catch (err) {
      console.error("Save address error:", err);
      setErrorMessage("Network error saving new address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Verify payment on server using HMAC SHA256 before marking order as PAID
  const verifyAndFinalizePayment = async ({
    orderId,
    orderNumber,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) => {
    try {
      setIsVerifyingPayment(true);
      setErrorMessage("");

      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderNumber,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      });

      const verifyData = await res.json();
      if (!res.ok || !verifyData.success) {
        const failureReason = verifyData.error || "Payment signature verification failed.";
        setPaymentFailureState({
          orderId,
          orderNumber,
          reason: failureReason,
        });
        setErrorMessage(failureReason);
        setIsVerifyingPayment(false);
        setIsSubmittingOrder(false);
        setIsTestCheckoutModalOpen(false);
        return false;
      }

      // Success! Clear the cart ONLY after confirmed successful payment on server
      clearCart();
      setIsTestCheckoutModalOpen(false);
      router.push(`/order-success/${orderNumber}`);
      return true;
    } catch (err) {
      console.error("Payment verification error:", err);
      setErrorMessage("Network error verifying payment. Please check your order status.");
      setIsVerifyingPayment(false);
      setIsSubmittingOrder(false);
      setIsTestCheckoutModalOpen(false);
      return false;
    }
  };

  // Record payment failure or cancellation on server
  const handleRecordFailure = async (orderId, orderNumber, reason) => {
    setPaymentFailureState({
      orderId,
      orderNumber,
      reason: reason || "Payment was not completed.",
    });
    setErrorMessage(reason || "Payment was cancelled or declined. Your bag is preserved.");
    setIsSubmittingOrder(false);
    setIsTestCheckoutModalOpen(false);

    try {
      await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderNumber,
          status: "failed",
          errorMessage: reason,
        }),
      });
    } catch (err) {
      console.error("Failed to record failure status:", err);
    }
  };

  // Place Order / Submit Checkout & Open Razorpay
  const handleCheckoutSubmit = async (e) => {
    e?.preventDefault?.();
    setErrorMessage("");
    setPaymentFailureState(null);

    if (!activeShippingAddress) {
      setErrorMessage("Please select or add a delivery address to complete your checkout.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Your shopping bag is empty. Please add items before checking out.");
      return;
    }

    try {
      setIsSubmittingOrder(true);

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: activeShippingAddress,
          paymentMethod: "RAZORPAY",
          idempotencyKey,
          notes: orderNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to initialize order.");
        setIsSubmittingOrder(false);
        return;
      }

      setPendingOrder(data);

      // Attempt to load and launch Razorpay checkout modal
      const hasScript = await loadRazorpayScript();
      const hasRealKey =
        data.keyId && !data.keyId.includes("placeholder") && !data.isMock;

      if (hasScript && typeof window !== "undefined" && window.Razorpay && hasRealKey) {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency || "INR",
          name: "Velour Atelier",
          description: `Order ${data.orderNumber}`,
          order_id: data.razorpayOrderId,
          handler: async function (response) {
            await verifyAndFinalizePayment({
              orderId: data.orderId,
              orderNumber: data.orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          prefill: {
            name: activeShippingAddress.fullName,
            contact: activeShippingAddress.phone,
            email: session?.user?.email || "customer@velour.com",
          },
          theme: { color: "#242424" },
          modal: {
            ondismiss: function () {
              handleRecordFailure(
                data.orderId,
                data.orderNumber,
                "Payment checkout was closed. Your shopping bag remains preserved."
              );
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          handleRecordFailure(
            data.orderId,
            data.orderNumber,
            response.error?.description || "Payment was declined by issuing bank."
          );
        });
        rzp.open();
      } else {
        // Test Mode Modal: Seamless interactive simulation dialog
        setIsTestCheckoutModalOpen(true);
        setIsSubmittingOrder(false);
      }
    } catch (err) {
      console.error("Checkout order creation error:", err);
      setErrorMessage("A network error occurred while placing your order. Please try again.");
      setIsSubmittingOrder(false);
    }
  };

  // 1. Loading State
  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#242424] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400">
          Loading Atelier Checkout...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State (Strict Customer Authentication Required)
  if (status === "unauthenticated") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-[#EBE6DD] text-center space-y-4 rounded-sm shadow-sm animate-fade-in">
        <div className="w-12 h-12 bg-[#F8F6F1] border border-[#EBE6DD] rounded-full flex items-center justify-center mx-auto text-[#242424]">
          <User className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wide text-[#242424]">
          Patron Sign In Required
        </h2>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Please authenticate with your Velour Atelier credentials to access your saved delivery addresses and secure order placement.
        </p>
        <div className="pt-2">
          <Button href="/login?callbackUrl=/checkout" variant="primary" size="md" className="w-full">
            <span>Sign In to Continue</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // 3. Empty Cart State
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-[#F8F6F1] border border-[#EBE6DD] rounded-full flex items-center justify-center mx-auto text-[#242424]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wide text-noir-900">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Please add clothing pieces to your shopping bag before proceeding to checkout.
        </p>
        <div className="pt-4">
          <Button href="/shop" variant="primary" size="lg">
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
      <div className="pb-8 border-b border-[#EBE6DD]">
        <span className="text-[11px] uppercase tracking-widest text-[#7F6650] font-semibold">
          Secure Atelier Checkout
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#242424] mt-1">
          Express Courier & Order Review
        </h1>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        {/* Left Column: Delivery Address Selection & Order Review */}
        <div className="lg:col-span-7 space-y-8">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-sm flex items-center space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Delivery Address Selection */}
          <div className="bg-white border border-[#EBE6DD] p-6 rounded-sm shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1EDE5]">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#242424]" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#242424]">
                  1. Delivery Destination
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewAddressForm({
                    ...INITIAL_NEW_ADDRESS,
                    fullName: session?.user?.name || "",
                  });
                  setAddressFormErrors({});
                  setIsAddAddressModalOpen(true);
                }}
                className="inline-flex items-center text-[11px] uppercase tracking-wider font-semibold text-[#7F6650] hover:text-[#242424] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add New Address</span>
              </button>
            </div>

            {isAddressesLoading ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                Loading saved delivery addresses...
              </div>
            ) : savedAddresses.length === 0 ? (
              <div className="p-6 bg-[#F8F6F1] border border-[#EBE6DD] rounded-sm text-center space-y-3">
                <MapPin className="w-6 h-6 mx-auto text-neutral-400" />
                <p className="text-xs text-neutral-600">
                  No saved delivery addresses found. Please add a shipping destination.
                </p>
                <Button
                  type="button"
                  onClick={() => setIsAddAddressModalOpen(true)}
                  variant="primary"
                  size="sm"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Delivery Address</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-4 border rounded-sm cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#242424] bg-[#F8F6F1] ring-1 ring-[#242424] shadow-sm"
                          : "border-[#EBE6DD] hover:border-[#D8CDBD] bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#242424]">
                            {addr.fullName}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] uppercase tracking-wider bg-[#242424] text-white px-1.5 py-0.5 rounded font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-600 font-medium">{addr.houseNumber}</p>
                        <p className="text-[11px] text-neutral-600">{addr.street}</p>
                        <p className="text-[11px] text-neutral-600">
                          {addr.city}, {addr.state} — {addr.postalCode}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-2">{addr.phone}</p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#F1EDE5] flex items-center justify-between text-[11px]">
                        <span className={`font-medium ${isSelected ? "text-[#242424]" : "text-neutral-400"}`}>
                          {isSelected ? "✓ Deliver Here" : "Select"}
                        </span>
                        <Link
                          href="/addresses"
                          target="_blank"
                          className="text-[10px] text-neutral-400 hover:text-[#242424] underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Order Items Review */}
          <div className="bg-white border border-[#EBE6DD] p-6 rounded-sm shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1EDE5]">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-[#242424]" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#242424]">
                  2. Selected Pieces ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              <Link
                href="/cart"
                className="text-[11px] text-[#7F6650] hover:text-[#242424] uppercase tracking-wider font-semibold underline underline-offset-4"
              >
                Modify Bag
              </Link>
            </div>

            <div className="divide-y divide-[#F1EDE5]">
              {items.map((item, idx) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor?.name || item.selectedColor}-${idx}`}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between space-x-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-20 bg-[#F8F6F1] flex-shrink-0 overflow-hidden rounded-sm border border-[#EBE6DD]">
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
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#242424]">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 space-x-2">
                        <span>Size: {item.selectedSize}</span>
                        {item.selectedColor && (
                          <span>| Color: {item.selectedColor?.name || item.selectedColor}</span>
                        )}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#242424]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Atelier Packaging & Notes */}
          <div className="bg-white border border-[#EBE6DD] p-6 rounded-sm shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#242424]">
              3. Atelier Dispatch Instructions (Optional)
            </h2>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Please leave with concierge; discreet luxury gift packaging requested."
              className="w-full p-3 text-xs border border-[#EBE6DD] rounded-sm focus:border-[#242424] focus:outline-none"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#EBE6DD] p-6 rounded-sm shadow-sm space-y-5 sticky top-28">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#242424] pb-3 border-b border-[#F1EDE5]">
              Order Summary
            </h2>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-[#242424]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[11px]">
                      Complimentary Global Courier
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
              <div className="border-t border-[#EBE6DD] pt-3 flex justify-between text-sm font-bold text-[#242424]">
                <span>Total Amount</span>
                <span className="font-serif text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Payment Failure / Cancellation Banner */}
            {paymentFailureState && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-sm space-y-2 animate-fade-in text-xs">
                <div className="flex items-center space-x-2 font-semibold text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Payment Unsuccessful</span>
                </div>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  {paymentFailureState.reason} Your delivery address and cart garments are safely preserved.
                </p>
                <Button
                  type="button"
                  onClick={handleCheckoutSubmit}
                  variant="outline"
                  size="sm"
                  className="mt-1 w-full border-rose-300 text-rose-800 hover:bg-rose-100"
                >
                  <span>Retry Razorpay Payment</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            )}

            {/* Payment Status Notice */}
            <div className="p-3 bg-[#F8F6F1] border border-[#EBE6DD] rounded-sm text-[11px] text-neutral-600 space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-[#242424]">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment Gateway: RAZORPAY TEST MODE</span>
              </div>
              <p className="text-neutral-500">
                A pending order will be created. Payment verification is cryptographically confirmed via HMAC SHA256 before marking order as paid.
              </p>
            </div>

            {/* Place Order CTA Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmittingOrder || isVerifyingPayment || items.length === 0}
                className="w-full flex items-center justify-center tracking-widest"
              >
                <span>
                  {isVerifyingPayment
                    ? "Verifying Payment..."
                    : isSubmittingOrder
                    ? "Preparing Payment..."
                    : `Pay with Razorpay • ${formatPrice(total)}`}
                </span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Security Guarantee */}
            <div className="pt-3 border-t border-[#F1EDE5] text-[11px] text-neutral-400 space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Authoritative Server-Validated Pricing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-neutral-500" />
                <span>256-Bit SSL Encrypted Atelier Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Inline Modal: Add New Address during Checkout */}
      {isAddAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white border border-[#EBE6DD] shadow-2xl rounded-sm w-full max-w-xl my-8 overflow-hidden">
            <div className="p-6 border-b border-[#EBE6DD] flex items-center justify-between bg-[#F8F6F1]">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-[#242424]" />
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#242424]">
                  Add Delivery Destination
                </h3>
              </div>
              <button
                onClick={() => setIsAddAddressModalOpen(false)}
                className="text-neutral-400 hover:text-[#242424] p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAddress} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddressForm.fullName}
                    onChange={(e) => handleAddressInputChange("fullName", e.target.value)}
                    placeholder="Recipient Name"
                    className={`w-full px-3 py-2 text-xs border rounded-sm focus:outline-none ${
                      addressFormErrors.fullName ? "border-rose-400" : "border-[#EBE6DD] focus:border-[#242424]"
                    }`}
                  />
                  {addressFormErrors.fullName && (
                    <p className="text-[10px] text-rose-600 mt-1">{addressFormErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                    Mobile Phone (India) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newAddressForm.phone}
                    onChange={(e) => handleAddressInputChange("phone", e.target.value)}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3 py-2 text-xs border rounded-sm focus:outline-none ${
                      addressFormErrors.phone ? "border-rose-400" : "border-[#EBE6DD] focus:border-[#242424]"
                    }`}
                  />
                  {addressFormErrors.phone && (
                    <p className="text-[10px] text-rose-600 mt-1">{addressFormErrors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                  Flat / House / Building <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddressForm.houseNumber}
                  onChange={(e) => handleAddressInputChange("houseNumber", e.target.value)}
                  placeholder="e.g. Penthouse 14B, Silver Oak Heights"
                  className={`w-full px-3 py-2 text-xs border rounded-sm focus:outline-none ${
                    addressFormErrors.houseNumber ? "border-rose-400" : "border-[#EBE6DD] focus:border-[#242424]"
                  }`}
                />
                {addressFormErrors.houseNumber && (
                  <p className="text-[10px] text-rose-600 mt-1">{addressFormErrors.houseNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                  Street / Area / Sector <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddressForm.street}
                  onChange={(e) => handleAddressInputChange("street", e.target.value)}
                  placeholder="e.g. 100 Feet Road, Indiranagar"
                  className={`w-full px-3 py-2 text-xs border rounded-sm focus:outline-none ${
                    addressFormErrors.street ? "border-rose-400" : "border-[#EBE6DD] focus:border-[#242424]"
                  }`}
                />
                {addressFormErrors.street && (
                  <p className="text-[10px] text-rose-600 mt-1">{addressFormErrors.street}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={newAddressForm.landmark}
                  onChange={(e) => handleAddressInputChange("landmark", e.target.value)}
                  placeholder="e.g. Near Indiranagar Metro Station"
                  className="w-full px-3 py-2 text-xs border border-[#EBE6DD] rounded-sm focus:border-[#242424] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddressForm.city}
                    onChange={(e) => handleAddressInputChange("city", e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-3 py-2 text-xs border rounded-sm focus:outline-none ${
                      addressFormErrors.city ? "border-rose-400" : "border-[#EBE6DD] focus:border-[#242424]"
                    }`}
                  />
                  {addressFormErrors.city && (
                    <p className="text-[10px] text-rose-600 mt-1">{addressFormErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAddressForm.state}
                    onChange={(e) => handleAddressInputChange("state", e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#EBE6DD] rounded-sm focus:border-[#242424] focus:outline-none bg-white"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newAddressForm.postalCode}
                    onChange={(e) =>
                      handleAddressInputChange("postalCode", e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="560038"
                    className={`w-full px-3 py-2 text-xs border rounded-sm focus:outline-none ${
                      addressFormErrors.postalCode ? "border-rose-400" : "border-[#EBE6DD] focus:border-[#242424]"
                    }`}
                  />
                  {addressFormErrors.postalCode && (
                    <p className="text-[10px] text-rose-600 mt-1">{addressFormErrors.postalCode}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBE6DD] flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setIsAddAddressModalOpen(false)}
                  variant="outline"
                  size="md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSavingAddress}
                >
                  <span>{isSavingAddress ? "Saving..." : "Use This Address"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Mode Razorpay Gateway Simulation Modal */}
      {isTestCheckoutModalOpen && pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#EBE6DD] shadow-2xl rounded-sm w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1EDE5]">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[#242424]" />
                <h3 className="font-serif text-base font-bold uppercase tracking-wider text-[#242424]">
                  Razorpay Checkout (Test Mode)
                </h3>
              </div>
              <button
                onClick={() =>
                  handleRecordFailure(
                    pendingOrder.orderId,
                    pendingOrder.orderNumber,
                    "Payment checkout modal closed by patron."
                  )
                }
                className="text-neutral-400 hover:text-[#242424]"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#F8F6F1] p-4 rounded-sm border border-[#EBE6DD] text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Order Reference:</span>
                <span className="font-mono font-bold text-[#242424]">{pendingOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Razorpay Order:</span>
                <span className="font-mono text-neutral-600 text-[11px]">{pendingOrder.razorpayOrderId}</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-sm text-[#242424] pt-2 border-t border-[#EBE6DD]">
                <span>Payable Total:</span>
                <span className="font-mono">{formatPrice(pendingOrder.totalAmount)}</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Razorpay Test Mode is active for development evaluation. Simulate gateway actions to trigger server-side HMAC SHA256 cryptographic verification:
            </p>

            <div className="space-y-2.5 pt-1">
              <Button
                type="button"
                onClick={() =>
                  verifyAndFinalizePayment({
                    orderId: pendingOrder.orderId,
                    orderNumber: pendingOrder.orderNumber,
                    razorpayOrderId: pendingOrder.razorpayOrderId,
                    razorpayPaymentId: `pay_test_${Date.now()}`,
                    razorpaySignature: "mock_signature_verified",
                  })
                }
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 border-none text-white"
                disabled={isVerifyingPayment}
              >
                <Check className="w-4 h-4 mr-2" />
                <span>{isVerifyingPayment ? "Verifying Payment..." : "Simulate Payment Success"}</span>
              </Button>

              <Button
                type="button"
                onClick={() =>
                  handleRecordFailure(
                    pendingOrder.orderId,
                    pendingOrder.orderNumber,
                    "Simulated bank decline: Insufficient card funds in test account."
                  )
                }
                variant="outline"
                size="md"
                className="w-full flex items-center justify-center border-rose-300 text-rose-700 hover:bg-rose-50"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>Simulate Payment Failure</span>
              </Button>

              <button
                type="button"
                onClick={() =>
                  handleRecordFailure(
                    pendingOrder.orderId,
                    pendingOrder.orderNumber,
                    "Checkout modal dismissed."
                  )
                }
                className="w-full text-center text-xs text-neutral-400 hover:text-[#242424] pt-1"
              >
                Cancel and Return to Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
