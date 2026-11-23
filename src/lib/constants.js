export const APP_CONFIG = {
  name: "VELOUR",
  tagline: "Contemporary Atelier & Haute Streetwear",
  description: "Curated modern wardrobe essentials, crafted with architectural silhouettes and premium sustainable fabrics.",
  freeShippingThreshold: 2499,
  defaultShippingFee: 199,
  taxRate: 0.12, // 12% GST
  supportEmail: "concierge@velour-atelier.com",
  phone: "+91 (800) 456-7890",
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const GENDERS = [
  { label: "All Collections", value: "all" },
  { label: "Men", value: "Men" },
  { label: "Women", value: "Women" },
  { label: "Unisex", value: "Unisex" },
];

export const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Highest Rated", value: "rating" },
];

export const ORDER_STATUS_MAP = {
  PROCESSING: { label: "Processing", color: "bg-amber-100 text-amber-800 border-amber-300" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-300" },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-800 border-purple-300" },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  CANCELLED: { label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-300" },
};
