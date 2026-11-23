"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/lib/seed-data";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";

export default function AdminOverviewPage() {
  const products = INITIAL_PRODUCTS;

  // Compute analytics
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stockCount <= 30).length;
  const totalInventoryUnits = products.reduce((sum, p) => sum + p.stockCount, 0);

  // Demo stats
  const totalRevenue = 428450;
  const totalOrders = 38;

  const recentOrders = [
    {
      id: "ord-1",
      orderNumber: "VEL-8941-2026",
      customer: "Aria Thorne",
      total: 10639,
      status: "SHIPPED",
      date: "Today, 10:30 AM",
    },
    {
      id: "ord-2",
      orderNumber: "VEL-7729-2026",
      customer: "Julian Hayes",
      total: 3499,
      status: "CONFIRMED",
      date: "Today, 09:15 AM",
    },
    {
      id: "ord-3",
      orderNumber: "VEL-6712-2026",
      customer: "Elena Rostova",
      total: 8733,
      status: "DELIVERED",
      date: "Yesterday",
    },
    {
      id: "ord-4",
      orderNumber: "VEL-5590-2026",
      customer: "Marcus Vance",
      total: 9499,
      status: "PROCESSING",
      date: "Yesterday",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[11px] uppercase tracking-ultra text-brand-600 font-semibold">
            Atelier Executive Desk
          </span>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tight text-noir-900 mt-1">
            Dashboard Overview
          </h1>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button href="/admin/products" variant="primary" size="sm">
            <Package className="w-3.5 h-3.5 mr-1.5" />
            <span>Manage Products</span>
          </Button>
          <Button href="/admin/orders" variant="outline" size="sm">
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            <span>Review Orders</span>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-neutral-200 p-5 rounded-sm shadow-sm space-y-2">
          <div className="flex justify-between items-center text-neutral-400">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-noir-900 font-serif">
            {formatPrice(totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">+18.4% from last month</p>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-sm shadow-sm space-y-2">
          <div className="flex justify-between items-center text-neutral-400">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Orders</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-noir-900 font-serif">{totalOrders}</div>
          <p className="text-[11px] text-neutral-500">Across All Categories</p>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-sm shadow-sm space-y-2">
          <div className="flex justify-between items-center text-neutral-400">
            <span className="text-xs uppercase tracking-wider font-semibold">Live Garments</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-noir-900 font-serif">{totalProducts}</div>
          <p className="text-[11px] text-neutral-500">{totalInventoryUnits} Units in Stock</p>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-sm shadow-sm space-y-2">
          <div className="flex justify-between items-center text-neutral-400">
            <span className="text-xs uppercase tracking-wider font-semibold">Low Stock Warnings</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 font-serif">{lowStockCount}</div>
          <p className="text-[11px] text-amber-800">Requires production replenishment</p>
        </div>
      </div>

      {/* Two Columns: Recent Orders (Left) + Low Stock Alert (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-sm shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-noir-900">
              Recent Fulfillment Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs uppercase tracking-wider text-brand-700 hover:text-noir-900 font-medium"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-noir-900 font-mono">{ord.orderNumber}</p>
                  <p className="text-[11px] text-neutral-500">
                    {ord.customer} • {ord.date}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-noir-900">{formatPrice(ord.total)}</p>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${
                      ord.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : ord.status === "SHIPPED"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-sm shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-noir-900 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Inventory Thresholds</span>
            </h2>
            <Link
              href="/admin/products"
              className="text-xs uppercase tracking-wider text-brand-700 hover:text-noir-900 font-medium"
            >
              Update Stock &rarr;
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {products
              .filter((p) => p.stockCount <= 30)
              .map((prod) => (
                <div key={prod.slug} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-noir-900 line-clamp-1">{prod.name}</p>
                    <p className="text-[11px] text-neutral-400 uppercase tracking-wider">
                      {prod.gender} • {prod.categorySlug}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded">
                      {prod.stockCount} Left
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

