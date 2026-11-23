"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

const WishlistContext = createContext(null);

const GUEST_STORAGE_KEY = "velour_wishlist_guest";

export function WishlistProvider({ children }) {
  const { data: session, status } = useSession();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const prevUserIdRef = useRef(null);

  /**
   * Synchronize wishlist state when authentication status or user ID changes.
   * Handles:
   * 1. Guest wishlist loading from localStorage.
   * 2. Merging guest wishlist into customer account upon login without duplicates.
   * 3. Loading customer wishlist from MongoDB Atlas.
   * 4. Resetting customer data when logging out.
   */
  useEffect(() => {
    if (status === "loading") return;

    const currentUserId = session?.user?.id;
    const isLoggingIn = !prevUserIdRef.current && currentUserId;
    const isLoggingOut = prevUserIdRef.current && !currentUserId;
    prevUserIdRef.current = currentUserId;

    async function syncWishlist() {
      setIsLoading(true);

      // A. Authenticated Customer
      if (currentUserId) {
        try {
          // Check if guest items exist in localStorage to merge
          const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
          let guestIds = [];
          if (savedGuest) {
            try {
              const parsed = JSON.parse(savedGuest);
              guestIds = Array.isArray(parsed)
                ? parsed.map((item) => item.id).filter(Boolean)
                : [];
            } catch (err) {
              console.error("Failed to parse guest wishlist", err);
            }
          }

          if (guestIds.length > 0) {
            // Merge guest wishlist into customer's database record
            const mergeRes = await fetch("/api/wishlist/merge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ guestProductIds: guestIds }),
            });

            if (mergeRes.ok) {
              const data = await mergeRes.json();
              if (data.success && Array.isArray(data.items)) {
                setWishlistItems(data.items);
                // Clean up guest storage so items aren't merged again
                localStorage.removeItem(GUEST_STORAGE_KEY);
                setIsLoaded(true);
                setIsLoading(false);
                return;
              }
            }
          }

          // Fetch customer's persistent wishlist from MongoDB Atlas
          const res = await fetch("/api/wishlist");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.items)) {
              setWishlistItems(data.items);
            }
          }
        } catch (error) {
          console.error("Failed to fetch customer wishlist:", error);
        } finally {
          setIsLoaded(true);
          setIsLoading(false);
        }
        return;
      }

      // B. Guest User
      try {
        const saved = localStorage.getItem(GUEST_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setWishlistItems(Array.isArray(parsed) ? parsed : []);
        } else {
          setWishlistItems([]);
        }
      } catch (e) {
        console.error("Failed to load guest wishlist", e);
        setWishlistItems([]);
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    }

    syncWishlist();
  }, [session?.user?.id, status]);

  /**
   * Persist guest wishlist to localStorage whenever wishlistItems changes for guests.
   * Customer wishlists are persisted to MongoDB Atlas via API, NOT guest localStorage.
   */
  useEffect(() => {
    if (!isLoaded || status === "loading") return;

    // Only write to guest localStorage if unauthenticated
    if (!session?.user?.id) {
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(wishlistItems));
      } catch (e) {
        console.error("Failed to persist guest wishlist", e);
      }
    }
  }, [wishlistItems, isLoaded, session?.user?.id, status]);

  /**
   * Toggle item in wishlist (Add if not present, remove if present).
   * Supports both authenticated customers (persisted to MongoDB Atlas) and guests (localStorage).
   */
  const toggleWishlist = useCallback(
    async (product) => {
      if (!product || !product.id) return;

      const productId = product.id;
      const isAlreadyInWishlist = wishlistItems.some(
        (item) => item.id === productId || item.slug === product.slug
      );

      const formattedProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.images?.[0] || product.image || "",
        category: product.category?.name || product.category || "Apparel",
        inStock: product.inStock !== false,
        sizes: product.sizes || [],
        colors: product.colors || [],
      };

      // 1. Optimistic UI update
      setWishlistItems((prev) => {
        if (isAlreadyInWishlist) {
          return prev.filter(
            (item) => item.id !== productId && item.slug !== product.slug
          );
        }
        return [...prev, formattedProduct];
      });

      // 2. If customer is authenticated, persist to MongoDB Atlas User.wishlistIds
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              action: isAlreadyInWishlist ? "remove" : "add",
            }),
          });

          if (!res.ok) {
            // Revert optimistic update on failure
            console.error("Server failed to update wishlist, reverting");
            setWishlistItems((prev) => {
              if (isAlreadyInWishlist) {
                return [...prev, formattedProduct];
              }
              return prev.filter(
                (item) => item.id !== productId && item.slug !== product.slug
              );
            });
          }
        } catch (err) {
          console.error("Network error toggling wishlist on server:", err);
          // Revert optimistic update
          setWishlistItems((prev) => {
            if (isAlreadyInWishlist) {
              return [...prev, formattedProduct];
            }
            return prev.filter(
              (item) => item.id !== productId && item.slug !== product.slug
            );
          });
        }
      }
    },
    [wishlistItems, session?.user?.id]
  );

  /**
   * Remove item from wishlist.
   */
  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!productId) return;

      const removedItem = wishlistItems.find(
        (item) => item.id === productId || item.slug === productId
      );

      // Optimistic update
      setWishlistItems((prev) =>
        prev.filter((item) => item.id !== productId && item.slug !== productId)
      );

      // If customer is authenticated, persist removal to MongoDB Atlas
      if (session?.user?.id && removedItem) {
        try {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: removedItem.id,
              action: "remove",
            }),
          });

          if (!res.ok) {
            console.error("Failed to remove item on server, reverting");
            setWishlistItems((prev) => [...prev, removedItem]);
          }
        } catch (err) {
          console.error("Network error removing item on server:", err);
          setWishlistItems((prev) => [...prev, removedItem]);
        }
      }
    },
    [wishlistItems, session?.user?.id]
  );

  /**
   * Check if a product is in the current wishlist
   */
  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return wishlistItems.some(
        (item) => item.id === productId || item.slug === productId
      );
    },
    [wishlistItems]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoaded,
        isLoading,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        totalWishlist: wishlistItems.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
