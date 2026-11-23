"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, CheckCircle, Clock, Truck, ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_MAP } from "@/lib/constants";
import Button from "@/components/common/Button";

const INITIAL_ADMIN_ORDERS = [
  {
    id: "ord-1",
    orderNumber: "VEL-8941-2026",
    customer: "Aria Thorne",
    email: "demo@velour.com",
    phone: "+91 98765 43210",
    date: "2026-11-20T10:30:00.000Z",
    orderStatus: "SHIPPED",
    paymentStatus: "PAID",
    paymentMethod: "RAZORPAY",
    totalAmount: 10639,
    address: "Flat 4B, Silver Oak Heights, Indiranagar, Bengaluru, 560038",
    items: [
      {
        name: "Cashmere Double-Breasted Overcoat",
        size: "M",
        color: "Camel",
        quantity: 1,
        price: 9499,
      },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "VEL-7729-2026",
    customer: "Julian Hayes",
    email: "julian@atelier.com",
    phone: "+91 98111 22334",
    date: "2026-11-21T09:15:00.000Z",
    orderStatus: "PROCESSING",
    paymentStatus: "PAID",
    paymentMethod: "RAZORPAY",
    totalAmount: 3499,
    address: "12 Marine Drive, Nariman Point, Mumbai, 400021",
    items: [
      {
        name: "Architectural Heavyweight Boxy Hoodie",
        size: "L",
        color: "Bone White",
        quantity: 1,
        price: 3499,
      },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "VEL-6712-2026",
    customer: "Elena Rostova",
    email: "elena@design.org",
    phone: "+91 99887 66554",
    date: "2026-11-19T14:15:00.000Z",
    orderStatus: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "RAZORPAY",
    totalAmount: 8733,
    address: "B-404, Defence Colony, New Delhi, 110024",
    items: [
      {
        name: "Wide-Leg Pleated Wool Trousers",
        size: "M",
        color: "Charcoal Heather",
        quantity: 1,
        price: 4299,
      },
      {
        name: "Sculptural Chunky Wool Cardigan",
        size: "S",
        color: "Oatmeal Melange",
        quantity: 1,
        price: 4899,
      },
    ],
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ADMIN_ORDERS);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOrders = orders.filter((o) =>
    statusFilter === "ALL" ? true : o.orderStatus === statusFilter
  );

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[11px] uppercase tracking-ultra text-brand-600 font-semibold">
            Atelier Dispatch & Logistics
          </span>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tight text-noir-900 mt-1">
            Order Fulfillment Management
          </h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {["ALL", "PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors border ${
              statusFilter === st
                ? "bg-noir-900 text-white border-noir-900 font-medium"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 uppercase tracking-widest text-neutral-500 text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Order Ref</th>
                <th className="py-3.5 px-4 font-semibold">Client</th>
                <th className="py-3.5 px-4 font-semibold">Destination</th>
                <th className="py-3.5 px-4 font-semibold">Items</th>
                <th className="py-3.5 px-4 font-semibold">Total</th>
                <th className="py-3.5 px-4 font-semibold">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-noir-900">
                    {ord.orderNumber}
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-semibold text-noir-900">{ord.customer}</p>
                    <p className="text-[10px] text-neutral-400">{ord.email}</p>
                  </td>

                  <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                    {ord.address}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-noir-900">
                      {ord.items.length} {ord.items.length === 1 ? "Garment" : "Garments"}
                    </span>
                    <p className="text-[10px] text-neutral-400">
                      {ord.items[0]?.name}
                      {ord.items.length > 1 ? ` +${ord.items.length - 1} more` : ""}
                    </p>
                  </td>

                  <td className="py-3 px-4 font-bold text-noir-900">
                    {formatPrice(ord.totalAmount)}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                      className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-1 border rounded focus:outline-none ${
                        ord.orderStatus === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : ord.orderStatus === "SHIPPED"
                          ? "bg-purple-50 text-purple-800 border-purple-300"
                          : "bg-amber-50 text-amber-800 border-amber-300"
                      }`}
                    >
                      <option value="PROCESSING">Processing</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
