import Link from "next/link";
import { APP_CONFIG } from "@/lib/constants";

export default function AnnouncementBar() {
  return (
    <div className="bg-noir-900 text-white text-[11px] font-medium tracking-widest uppercase py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden sm:flex items-center space-x-3">
          <span className="text-neutral-400">Complimentary Courier Shipping</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-300">Orders above ₹2,499</span>
        </div>
        <div className="mx-auto sm:mx-0 text-center flex items-center space-x-2">
          <span>ATELIER ALL-COLLECTIONS 2026 NOW LIVE</span>
          <Link
            href="/shop"
            className="underline underline-offset-4 hover:text-brand-300 transition-colors ml-1 font-semibold"
          >
            Explore
          </Link>
        </div>
        <div className="hidden lg:flex items-center space-x-4 text-neutral-400">
          <Link href="/shop?gender=Women" className="hover:text-white transition-colors">
            Women
          </Link>
          <Link href="/shop?gender=Men" className="hover:text-white transition-colors">
            Men
          </Link>
          <Link href="/shop?gender=Kids" className="hover:text-white transition-colors">
            Kids
          </Link>
          <Link href="/shop?gender=Unisex" className="hover:text-white transition-colors">
            Unisex
          </Link>
          <span className="text-neutral-600">|</span>
          <span className="text-brand-300">INR (₹)</span>
        </div>
      </div>
    </div>
  );
}
