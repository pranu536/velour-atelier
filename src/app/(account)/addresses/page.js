"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  Star,
  Phone,
  AlertCircle,
  ArrowLeft,
  X,
  Building,
} from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import Badge from "@/components/common/Badge";
import { INDIAN_STATES, validateAddress } from "@/lib/addressValidation";

const INITIAL_FORM = {
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

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch addresses for authenticated customer from MongoDB Atlas
  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.addresses)) {
          setAddresses(data.addresses);
        }
      } else if (res.status === 401) {
        router.push("/login?callbackUrl=/addresses");
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      showNotification("error", "Failed to retrieve your saved addresses.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAddresses();
    } else if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/addresses");
    }
  }, [status, fetchAddresses, router]);

  // Open modal for adding a new address
  const handleOpenAdd = () => {
    setEditingAddressId(null);
    setFormData({
      ...INITIAL_FORM,
      fullName: session?.user?.name || "",
      isDefault: addresses.length === 0,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing an existing address
  const handleOpenEdit = (addr) => {
    setEditingAddressId(addr.id);
    setFormData({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      houseNumber: addr.houseNumber || "",
      street: addr.street || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "Maharashtra",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      isDefault: Boolean(addr.isDefault),
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddressId(null);
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  // Handle Form Input Changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Submit Add or Edit Address
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors, sanitized } = validateAddress(formData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const isEditing = Boolean(editingAddressId);
      const endpoint = isEditing
        ? `/api/addresses/${editingAddressId}`
        : "/api/addresses";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          showNotification("error", data.error || "Failed to save address.");
        }
        return;
      }

      setAddresses(data.addresses);
      showNotification(
        "success",
        isEditing
          ? "Delivery address updated successfully."
          : "New delivery address added."
      );
      handleCloseModal();
    } catch (err) {
      console.error("Save address error:", err);
      showNotification("error", "A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set Address as Default
  const handleSetDefault = async (addressId) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}/default`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.addresses);
        showNotification("success", "Primary default delivery address updated.");
      } else {
        showNotification("error", data.error || "Failed to update default address.");
      }
    } catch (err) {
      console.error("Set default error:", err);
      showNotification("error", "Failed to update default address.");
    }
  };

  // Delete Address
  const handleDelete = async (addressId) => {
    try {
      setDeletingId(addressId);
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.addresses);
        showNotification("success", "Delivery address removed.");
      } else {
        showNotification("error", data.error || "Failed to remove address.");
      }
    } catch (err) {
      console.error("Delete address error:", err);
      showNotification("error", "Failed to remove address.");
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#242424] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400">
          Loading Saved Delivery Addresses...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-400 mb-6">
        <Link href="/" className="hover:text-[#242424] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/profile" className="hover:text-[#242424] transition-colors">
          Account
        </Link>
        <span>/</span>
        <span className="text-[#242424] font-semibold">Delivery Addresses</span>
      </nav>

      {/* Header Banner */}
      <div className="pb-8 border-b border-[#EBE6DD] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#242424]">
            Delivery Addresses
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">
            Manage your residences, ateliers, and primary shipping destinations.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="md"
          className="inline-flex items-center space-x-2"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Address</span>
        </Button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`mt-6 p-4 rounded-sm text-xs font-medium tracking-wide flex items-center space-x-2 animate-fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="max-w-md mx-auto my-16 p-8 bg-white border border-[#EBE6DD] text-center space-y-4 rounded-sm shadow-sm">
          <div className="w-12 h-12 bg-[#F8F6F1] border border-[#EBE6DD] rounded-full flex items-center justify-center mx-auto text-[#242424]">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-xl font-bold uppercase tracking-wide text-[#242424]">
            No Addresses Saved
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            You haven't saved any delivery addresses yet. Add your primary residence or work address for expedited express checkout.
          </p>
          <div className="pt-2">
            <Button onClick={handleOpenAdd} variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Your First Address</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative bg-white border transition-all duration-200 flex flex-col justify-between rounded-sm p-6 shadow-sm ${
                addr.isDefault
                  ? "border-[#242424] ring-1 ring-[#242424]"
                  : "border-[#EBE6DD] hover:border-[#D8CDBD]"
              }`}
            >
              <div>
                {/* Header: Full Name & Default Badge */}
                <div className="flex items-start justify-between pb-3 border-b border-[#F1EDE5]">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#242424]">
                      {addr.fullName}
                    </h3>
                    <div className="flex items-center text-xs text-neutral-500 mt-1 space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                  {addr.isDefault && (
                    <Badge variant="bestseller" size="sm">
                      Default
                    </Badge>
                  )}
                </div>

                {/* Address Body */}
                <div className="py-4 text-xs text-neutral-600 space-y-1 leading-relaxed">
                  <p className="font-medium text-[#242424]">{addr.houseNumber}</p>
                  <p>{addr.street}</p>
                  {addr.landmark && (
                    <p className="text-neutral-400">Landmark: {addr.landmark}</p>
                  )}
                  <p>
                    {addr.city}, {addr.state} — {addr.postalCode}
                  </p>
                  <p className="text-neutral-400 uppercase tracking-widest text-[10px] pt-1">
                    {addr.country || "India"}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#F1EDE5] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="inline-flex items-center text-xs font-medium text-[#242424] hover:text-[#7F6650] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    className="inline-flex items-center text-xs font-medium text-neutral-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>{deletingId === addr.id ? "Removing..." : "Delete"}</span>
                  </button>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] uppercase tracking-wider font-semibold text-[#7F6650] hover:text-[#242424] transition-colors underline underline-offset-4"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white border border-[#EBE6DD] shadow-2xl rounded-sm w-full max-w-xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EBE6DD] flex items-center justify-between bg-[#F8F6F1]">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-[#242424]" />
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#242424]">
                  {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-[#242424] transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Row 1: Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                    Recipient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="e.g. Aria Thorne"
                    className={`w-full px-3 py-2.5 text-xs border rounded-sm focus:outline-none transition-colors ${
                      errors.fullName
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-[#EBE6DD] focus:border-[#242424]"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-[10px] text-rose-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                    Phone Number (India) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3 py-2.5 text-xs border rounded-sm focus:outline-none transition-colors ${
                      errors.phone
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-[#EBE6DD] focus:border-[#242424]"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Row 2: House Number / Building */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                  Flat / House No. / Building / Floor <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.houseNumber}
                  onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                  placeholder="e.g. Penthouse 14B, Silver Oak Heights"
                  className={`w-full px-3 py-2.5 text-xs border rounded-sm focus:outline-none transition-colors ${
                    errors.houseNumber
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-[#EBE6DD] focus:border-[#242424]"
                  }`}
                />
                {errors.houseNumber && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.houseNumber}</p>
                )}
              </div>

              {/* Row 3: Street / Area */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                  Street Address / Area / Sector <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  placeholder="e.g. 100 Feet Road, Indiranagar"
                  className={`w-full px-3 py-2.5 text-xs border rounded-sm focus:outline-none transition-colors ${
                    errors.street
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-[#EBE6DD] focus:border-[#242424]"
                  }`}
                />
                {errors.street && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.street}</p>
                )}
              </div>

              {/* Row 4: Landmark (Optional) */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                  Landmark <span className="text-neutral-400 text-[9px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => handleInputChange("landmark", e.target.value)}
                  placeholder="e.g. Near Indiranagar Metro Station"
                  className="w-full px-3 py-2.5 text-xs border border-[#EBE6DD] rounded-sm focus:border-[#242424] focus:outline-none transition-colors"
                />
              </div>

              {/* Row 5: City, State & PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-3 py-2.5 text-xs border rounded-sm focus:outline-none transition-colors ${
                      errors.city
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-[#EBE6DD] focus:border-[#242424]"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[10px] text-rose-600 mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-semibold text-neutral-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-[#EBE6DD] rounded-sm focus:border-[#242424] focus:outline-none bg-white transition-colors"
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
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 560038"
                    className={`w-full px-3 py-2.5 text-xs border rounded-sm focus:outline-none transition-colors ${
                      errors.postalCode
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-[#EBE6DD] focus:border-[#242424]"
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="text-[10px] text-rose-600 mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Row 6: Country & Default Checkbox */}
              <div className="pt-2 border-t border-[#F1EDE5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => handleInputChange("isDefault", e.target.checked)}
                    className="w-4 h-4 rounded text-[#242424] border-neutral-300 focus:ring-0"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    Make this my default delivery address
                  </span>
                </label>

                <div className="text-[11px] text-neutral-400 uppercase tracking-widest">
                  Country: <span className="font-semibold text-[#242424]">India</span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-[#EBE6DD] flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  variant="outline"
                  size="md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Saving..." : editingAddressId ? "Save Changes" : "Save Address"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

