"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_MAP } from "@/lib/constants";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";

// Initial realistic customer orders for demonstration
const INITIAL_DEMO_ORDERS = [
  {
    id: "ord-1",
    orderNumber: "VEL-8941-2026",
    createdAt: "2026-11-20T10:30:00.000Z",
    orderStatus: "SHIPPED",
    paymentStatus: "PAID",
    paymentMethod: "RAZORPAY",
    subtotal: 9499,
    shippingFee: 0,
    tax: 1140,
    totalAmount: 10639,
    shippingAddress: {
      fullName: "Aria Thorne",
      street: "Flat 4B, Silver Oak Heights, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
    },
    items: [
      {
        productId: "mock-prod-1",
        name: "Cashmere Double-Breasted Overcoat",
        image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop",
        size: "M",
        color: "Camel",
        price: 9499,
        quantity: 1,
        total: 9499,
      },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "VEL-6712-2026",
    createdAt: "2026-10-15T14:15:00.000Z",
    orderStatus: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "RAZORPAY",
    subtotal: 7798,
    shippingFee: 0,
    tax: 935,
    totalAmount: 8733,
    shippingAddress: {
      fullName: "Aria Thorne",
      street: "Flat 4B, Silver Oak Heights, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
    },
    items: [
      {
        productId: "mock-prod-2",
        name: "Architectural Heavyweight Boxy Hoodie",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
        size: "L",
        color: "Bone White",
        price: 3499,
        quantity: 1,
        total: 3499,
      },
      {
        productId: "mock-prod-4",
        name: "Wide-Leg Pleated Wool Trousers",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop",
        size: "M",
        color: "Charcoal Heather",
        price: 4299,
        quantity: 1,
        total: 4299,
      },
    ],
  },
];

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState(INITIAL_DEMO_ORDERS);
  const [expandedOrder, setExpandedOrder] = useState("ord-1");

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const renderStatusBadge = (statusKey) => {
    const config = ORDER_STATUS_MAP[statusKey] || {
      label: statusKey,
      color: "bg-neutral-100 text-neutral-800",
    };
    return (
      <span
        className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-ultra text-brand-600 font-semibold">
            Client Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-noir-900 mt-1">
            Order History & Tracking
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time fulfillment tracking and invoice records for your garments.
          </p>
        </div>
        <Link href="/shop" className="mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <span>Explore New Drops</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={order.id}
              className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden transition-all"
            >
              {/* Order Card Header */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-5 sm:p-6 bg-neutral-50/70 border-b border-neutral-100 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none hover:bg-neutral-100/60 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 block">
                      Order Reference
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-noir-900 font-mono">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 block">
                      Placed On
                    </span>
                    <span className="text-xs text-neutral-700 font-medium">{orderDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 block">
                      Total Amount
                    </span>
                    <span className="text-xs font-bold text-noir-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {renderStatusBadge(order.orderStatus)}
                  <span className="text-neutral-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </div>
              </div>

              {/* Order Tracking Progress Bar */}
              <div className="px-6 py-4 bg-brand-50/30 border-b border-neutral-100">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase tracking-widest font-semibold">
                  <div className="text-emerald-700">✓ Placed</div>
                  <div className="text-emerald-700">✓ Confirmed</div>
                  <div className={order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED" ? "text-emerald-700" : "text-neutral-400"}>
                    {order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED" ? "✓ Shipped" : "○ Shipping"}
                  </div>
                  <div className={order.orderStatus === "DELIVERED" ? "text-emerald-700" : "text-neutral-400"}>
                    {order.orderStatus === "DELIVERED" ? "✓ Delivered" : "○ Delivery"}
                  </div>
                </div>
              </div>

              {/* Collapsible Order Items & Details */}
              {isExpanded && (
                <div className="p-6 space-y-6">
                  {/* Items */}
                  <div className="divide-y divide-neutral-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-20 bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
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
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-noir-900">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-neutral-500 mt-1">
                              Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                            </p>
                            <p className="text-xs font-medium text-noir-900 mt-1">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-noir-900">
                          {formatPrice(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Breakdown & Shipping Address */}
                  <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div>
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                        Delivery Destination
                      </h5>
                      <p className="font-semibold text-noir-900">{order.shippingAddress.fullName}</p>
                      <p className="text-neutral-600 mt-1 leading-relaxed">
                        {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-neutral-500 mt-1">Payment: {order.paymentMethod} (PAID)</p>
                    </div>

                    <div className="space-y-1.5 md:text-right">
                      <div className="flex justify-between md:justify-end md:space-x-8 text-neutral-600">
                        <span>Subtotal:</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between md:justify-end md:space-x-8 text-neutral-600">
                        <span>Shipping:</span>
                        <span className="text-emerald-700 font-medium">Complimentary</span>
                      </div>
                      <div className="flex justify-between md:justify-end md:space-x-8 text-neutral-600">
                        <span>GST (12%):</span>
                        <span>{formatPrice(order.tax)}</span>
                      </div>
                      <div className="flex justify-between md:justify-end md:space-x-8 text-sm font-bold text-noir-900 pt-2 border-t border-neutral-200">
                        <span>Paid Total:</span>
                        <span className="font-serif">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
