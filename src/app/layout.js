import "./globals.css";
import AuthSessionProvider from "@/context/AuthSessionProvider";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { APP_CONFIG } from "@/lib/constants";

export const metadata = {
  title: `${APP_CONFIG.name} | ${APP_CONFIG.tagline}`,
  description: APP_CONFIG.description,
  keywords: "luxury clothing, streetwear, modern fashion, tailored overcoats, hoodies, apparel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-noir-900 antialiased selection:bg-brand-500 selection:text-white">
        <AuthSessionProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <CartDrawer />
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

