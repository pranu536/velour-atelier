"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  LogOut,
  Mail,
  Phone,
} from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Local addresses state (initialized with demo address)
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      fullName: "Aria Thorne",
      phone: "+91 98765 43210",
      street: "Flat 4B, Silver Oak Heights, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
      isDefault: true,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          Loading Atelier Profile...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-neutral-200 text-center space-y-4">
        <User className="w-10 h-10 mx-auto text-neutral-400" />
        <h2 className="font-serif text-xl font-bold uppercase tracking-wide">
          Authentication Required
        </h2>
        <p className="text-xs text-neutral-500">
          Please sign in to view your profile and manage saved delivery addresses.
        </p>
        <Button variant="primary" size="md">
          <Link href="/login?callbackUrl=/profile">Sign In Now</Link>
        </Button>
      </div>
    );
  }

  const handleSaveAddress = (e) => {
    e.preventDefault();
    const id = `addr-${Date.now()}`;
    setAddresses((prev) => [
      ...prev.map((a) => (newAddress.isDefault ? { ...a, isDefault: false } : a)),
      { id, ...newAddress },
    ]);
    setIsAddModalOpen(false);
    setNewAddress({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    });
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="pb-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-ultra text-brand-600 font-semibold">
            Maison Account
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-noir-900 mt-1">
            Client Profile
          </h1>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Link href="/orders">
            <Button variant="outline" size="sm">
              <Package className="w-3.5 h-3.5 mr-1.5" />
              <span>Order History</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Client Details */}
        <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-sm space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b border-neutral-100">
            <div className="w-14 h-14 bg-noir-900 text-white rounded-full flex items-center justify-center font-serif text-xl font-bold">
              {session.user.name?.[0] || "U"}
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-noir-900">
                {session.user.name}
              </h2>
              <p className="text-xs text-neutral-400">{session.user.email}</p>
              <div className="mt-1.5">
                <span className="px-2 py-0.5 bg-brand-50 border border-brand-200 text-brand-800 text-[10px] font-semibold uppercase tracking-wider rounded">
                  {session.user.role || "CUSTOMER"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs text-neutral-600">
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>{session.user.email}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Shield className="w-4 h-4 text-neutral-400" />
              <span>Password & 2FA Protected</span>
            </div>
          </div>

          {session.user.role === "ADMIN" && (
            <div className="pt-4 border-t border-neutral-100">
              <Link href="/admin">
                <Button variant="gold" size="md" className="w-full">
                  <span>Enter Admin Dashboard</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Address Book */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 p-6 rounded-sm shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-noir-900 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>Saved Shipping Addresses</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Manage addresses for express courier checkout.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add Address</span>
              </Button>
            </div>

            {/* Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-sm relative space-y-2 transition-all ${
                    address.isDefault
                      ? "border-noir-900 bg-neutral-50/50"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-noir-900">
                      {address.fullName}
                    </h4>
                    {address.isDefault && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-noir-900 text-white uppercase tracking-wider rounded font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {address.street}, {address.city}, {address.state} - {address.postalCode}
                  </p>
                  <p className="text-xs text-neutral-500">{address.phone}</p>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    {!address.isDefault ? (
                      <button
                        onClick={() => setDefaultAddress(address.id)}
                        className="text-neutral-500 hover:text-noir-900 uppercase tracking-wider text-[11px] font-medium"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-emerald-700 text-[11px] flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Default Address
                      </span>
                    )}

                    <button
                      onClick={() => deleteAddress(address.id)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Shipping Address"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="Recipient Full Name"
            value={newAddress.fullName}
            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
          />
          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="+91 98765 43210"
            value={newAddress.phone}
            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
          />
          <Input
            label="Street Address / Suite"
            required
            placeholder="House/Flat No., Building, Street"
            value={newAddress.street}
            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              required
              placeholder="e.g. Mumbai"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
            />
            <Input
              label="State"
              required
              placeholder="e.g. Maharashtra"
              value={newAddress.state}
              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Postal Code (PIN)"
              required
              placeholder="e.g. 400001"
              value={newAddress.postalCode}
              onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
            />
            <Input
              label="Country"
              required
              value={newAddress.country}
              disabled
            />
          </div>

          <label className="flex items-center text-xs text-neutral-600 pt-1">
            <input
              type="checkbox"
              className="accent-noir-900 mr-2 rounded"
              checked={newAddress.isDefault}
              onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
            />
            <span>Set as default delivery address</span>
          </label>

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
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
