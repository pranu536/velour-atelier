"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  AlertCircle,
  Check,
  X,
  Package,
} from "lucide-react";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from "@/lib/seed-data";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // New product form state
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    categorySlug: "outerwear-coats",
    gender: "Men",
    price: "",
    compareAtPrice: "",
    stockCount: 50,
    description: "",
    image: "",
  });

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categorySlug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProduct = (slug) => {
    if (confirm("Are you sure you wish to remove this garment from the active catalog?")) {
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
    }
  };

  const handleStockAdjust = (slug, delta) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.slug === slug) {
          const newStock = Math.max(0, p.stockCount + delta);
          return { ...p, stockCount: newStock, inStock: newStock > 0 };
        }
        return p;
      })
    );
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    const slug =
      productForm.slug ||
      productForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

    const newProd = {
      id: `prod-${Date.now()}`,
      name: productForm.name,
      slug,
      categorySlug: productForm.categorySlug,
      gender: productForm.gender,
      price: parseFloat(productForm.price) || 2999,
      compareAtPrice: productForm.compareAtPrice ? parseFloat(productForm.compareAtPrice) : null,
      stockCount: parseInt(productForm.stockCount, 10) || 50,
      inStock: true,
      description: productForm.description || "Fine crafted atelier garment.",
      details: ["100% Sustainable Cotton Blend", "Tailored fit", "Dry clean only"],
      sizes: ["S", "M", "L", "XL"],
      colors: [{ name: "Onyx Black", hexCode: "#111111" }],
      images: [
        productForm.image ||
          "https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop",
      ],
      isFeatured: false,
      isNewArrival: true,
      rating: 5.0,
      reviewsCount: 1,
    };

    setProducts([newProd, ...products]);
    setIsAddModalOpen(false);
    setProductForm({
      name: "",
      slug: "",
      categorySlug: "outerwear-coats",
      gender: "Men",
      price: "",
      compareAtPrice: "",
      stockCount: 50,
      description: "",
      image: "",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[11px] uppercase tracking-ultra text-brand-600 font-semibold">
            Catalog & Inventory Management
          </span>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tight text-noir-900 mt-1">
            Garments & Variants
          </h1>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add New Garment</span>
          </Button>
        </div>
      </div>

      {/* Search & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search garment title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-sm bg-white focus:outline-none focus:border-noir-900"
          />
        </div>
        <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
          {filteredProducts.length} Garments Found
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 uppercase tracking-widest text-neutral-500 text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Piece</th>
                <th className="py-3.5 px-4 font-semibold">Category & Gender</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Inventory Stock</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((prod) => (
                <tr key={prod.slug} className="hover:bg-neutral-50/70 transition-colors">
                  {/* Image & Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-14 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                        {prod.images?.[0] && (
                          <Image
                            src={prod.images[0]}
                            alt={prod.name}
                            fill
                            className="object-cover object-top"
                            sizes="40px"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-noir-900 line-clamp-1">{prod.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{prod.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category & Gender */}
                  <td className="py-3 px-4 uppercase text-neutral-600">
                    <p className="font-medium">{prod.categorySlug.replace("-", " ")}</p>
                    <p className="text-[10px] text-neutral-400">{prod.gender}</p>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 font-semibold text-noir-900">
                    {formatPrice(prod.price)}
                  </td>

                  {/* Stock adjuster */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStockAdjust(prod.slug, -5)}
                        className="w-6 h-6 border border-neutral-300 rounded flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                      >
                        -
                      </button>
                      <span className="font-bold text-noir-900 w-8 text-center">
                        {prod.stockCount}
                      </span>
                      <button
                        onClick={() => handleStockAdjust(prod.slug, 5)}
                        className="w-6 h-6 border border-neutral-300 rounded flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    {prod.stockCount > 0 ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold uppercase tracking-wider rounded">
                        In Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-semibold uppercase tracking-wider rounded">
                        Sold Out
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteProduct(prod.slug)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Atelier Garment"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            label="Garment Title"
            required
            placeholder="e.g. Minimalist Cashmere Trench"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-neutral-700 block mb-1.5">
                Category
              </label>
              <select
                value={productForm.categorySlug}
                onChange={(e) => setProductForm({ ...productForm, categorySlug: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-sm bg-white"
              >
                {INITIAL_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-neutral-700 block mb-1.5">
                Gender
              </label>
              <select
                value={productForm.gender}
                onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-sm bg-white"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price (₹)"
              type="number"
              required
              placeholder="3499"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
            />
            <Input
              label="Compare At (₹)"
              type="number"
              placeholder="4999"
              value={productForm.compareAtPrice}
              onChange={(e) =>
                setProductForm({ ...productForm, compareAtPrice: e.target.value })
              }
            />
            <Input
              label="Initial Stock"
              type="number"
              required
              placeholder="50"
              value={productForm.stockCount}
              onChange={(e) => setProductForm({ ...productForm, stockCount: e.target.value })}
            />
          </div>

          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            value={productForm.image}
            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
            helperText="Provide high-resolution image link"
          />

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-neutral-700 block mb-1.5">
              Garment Description
            </label>
            <textarea
              rows={3}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:border-noir-900"
              placeholder="Architectural cuts and sustainable fabric construction..."
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Publish Garment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

