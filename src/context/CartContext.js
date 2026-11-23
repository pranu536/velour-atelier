"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { APP_CONFIG } from "@/lib/constants";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState({
    isValid: true,
    issues: [],
    lastChecked: null,
  });

  // Track the current storage key being worked on
  const activeStorageKeyRef = useRef(null);

  // Determine user-scoped storage key: customer isolation vs guest cart
  const getStorageKey = useCallback((userId) => {
    return userId ? `velour_cart_user_${userId}` : "velour_cart_guest";
  }, []);

  // Load cart from isolated localStorage when user session changes or mounts
  useEffect(() => {
    if (status === "loading") return;

    const currentKey = getStorageKey(session?.user?.id);
    activeStorageKeyRef.current = currentKey;

    try {
      const saved = localStorage.getItem(currentKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setItems(Array.isArray(parsed) ? parsed : []);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error(`Failed to load cart for key: ${currentKey}`, e);
      setItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, [session?.user?.id, status, getStorageKey]);

  // Persist cart to active user's isolated localStorage
  useEffect(() => {
    if (!isLoaded || status === "loading") return;

    const currentKey = getStorageKey(session?.user?.id);
    if (activeStorageKeyRef.current !== currentKey) return;

    try {
      localStorage.setItem(currentKey, JSON.stringify(items));
    } catch (e) {
      console.error(`Failed to persist cart for key: ${currentKey}`, e);
    }
  }, [items, isLoaded, session?.user?.id, status, getStorageKey]);

  /**
   * Add a product to the cart.
   * Requires selecting available size and colour when applicable.
   */
  const addToCart = (product, { size, color, quantity = 1 } = {}) => {
    if (!product) {
      return { success: false, error: "Invalid product." };
    }

    if (product.inStock === false || (product.stockCount !== undefined && product.stockCount <= 0)) {
      return { success: false, error: "This item is currently sold out." };
    }

    // Require size selection if product has sizes
    if (product.sizes && product.sizes.length > 0) {
      if (!size) {
        return {
          success: false,
          error: "Please select an available size.",
          field: "size",
        };
      }
      if (!product.sizes.includes(size)) {
        return {
          success: false,
          error: `Selected size "${size}" is not available.`,
          field: "size",
        };
      }
    }

    // Require colour selection if product has colours
    if (product.colors && product.colors.length > 0) {
      if (!color || !color.name) {
        return {
          success: false,
          error: "Please select an available colour.",
          field: "color",
        };
      }
      const hasColor = product.colors.some(
        (c) => c.name.toLowerCase() === color.name.toLowerCase()
      );
      if (!hasColor) {
        return {
          success: false,
          error: `Selected colour "${color.name}" is not available.`,
          field: "color",
        };
      }
    }

    const chosenSize = size || (product.sizes?.[0] ?? "Standard");
    const chosenColor = color || (product.colors?.[0] ?? { name: "Standard" });
    const addQty = Math.max(1, parseInt(quantity, 10) || 1);

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === chosenSize &&
          item.selectedColor?.name === chosenColor?.name
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const currentQty = next[existingIndex].quantity;
        const maxStock = product.stockCount || 999;
        const newQty = Math.min(currentQty + addQty, maxStock);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
        };
        return next;
      }

      const newItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: chosenColor?.image || product.images?.[0] || "",
        selectedSize: chosenSize,
        selectedColor: chosenColor,
        quantity: addQty,
        inStock: product.inStock !== false,
        stockCount: product.stockCount,
      };

      return [...prev, newItem];
    });

    setIsOpen(true);
    return { success: true };
  };

  /**
   * Remove individual item from cart by composite key
   */
  const removeFromCart = (id, size, colorName) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedSize === size &&
            item.selectedColor?.name === colorName
          )
      )
    );
  };

  /**
   * Update quantity of an individual item
   */
  const updateQuantity = (id, size, colorName, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id, size, colorName);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (
          item.id === id &&
          item.selectedSize === size &&
          item.selectedColor?.name === colorName
        ) {
          const maxStock = item.stockCount || 999;
          const cappedQty = Math.min(newQuantity, maxStock);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  /**
   * Empty the entire cart
   */
  const clearCart = () => {
    setItems([]);
  };

  /**
   * Validate cart with server directly against live MongoDB Atlas stock and prices.
   * Never trusts client-side prices or totals.
   */
  const validateCart = useCallback(async () => {
    if (items.length === 0) {
      setValidationState({ isValid: true, issues: [], lastChecked: new Date() });
      return { valid: true, issues: [] };
    }

    try {
      setIsValidating(true);
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        throw new Error("Validation API returned error");
      }

      const data = await res.json();
      if (data.success) {
        // Sync items if server recalculated prices or adjusted quantities
        if (data.items && data.items.length > 0) {
          const hasChanges =
            data.items.length !== items.length ||
            data.items.some((vItem, idx) => {
              const current = items[idx];
              return (
                !current ||
                current.price !== vItem.price ||
                current.quantity !== vItem.quantity
              );
            });

          if (hasChanges) {
            setItems(data.items);
          }
        }

        setValidationState({
          isValid: data.valid,
          issues: data.issues || [],
          lastChecked: new Date(),
        });

        return data;
      }
    } catch (err) {
      console.error("Cart validation error:", err);
    } finally {
      setIsValidating(false);
    }

    return null;
  }, [items]);

  // Derived calculations
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee =
    subtotal === 0 || subtotal >= APP_CONFIG.freeShippingThreshold
      ? 0
      : APP_CONFIG.defaultShippingFee;
  const tax = Math.round(subtotal * APP_CONFIG.taxRate);
  const total = subtotal + shippingFee + tax;
  const freeShippingRemaining = Math.max(0, APP_CONFIG.freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / APP_CONFIG.freeShippingThreshold) * 100)
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        isLoaded,
        isValidating,
        validationState,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        validateCart,
        totalItems,
        subtotal,
        shippingFee,
        tax,
        total,
        freeShippingRemaining,
        freeShippingProgress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
