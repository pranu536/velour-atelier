"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { APP_CONFIG } from "@/lib/constants";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("velour_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage on state changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("velour_cart", JSON.stringify(items));
      } catch (e) {
        console.error("Failed to persist cart", e);
      }
    }
  }, [items, isLoaded]);

  const addToCart = (product, { size, color, quantity = 1 }) => {
    setItems((prev) => {
      // Create a unique composite key for item variant
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor?.name === color?.name
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      const newItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: color?.image || product.images?.[0] || "",
        selectedSize: size,
        selectedColor: color,
        quantity,
      };

      return [...prev, newItem];
    });

    setIsOpen(true);
  };

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
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

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
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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

