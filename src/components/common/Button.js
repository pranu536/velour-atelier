"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs";

  const variants = {
    primary:
      "bg-noir-900 text-white hover:bg-noir-800 focus:ring-noir-900 border border-noir-900",
    secondary:
      "bg-brand-100 text-brand-900 hover:bg-brand-200 focus:ring-brand-400 border border-brand-200",
    outline:
      "border border-noir-900 text-noir-900 bg-transparent hover:bg-noir-900 hover:text-white focus:ring-noir-900",
    gold:
      "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 border border-brand-500 shadow-sm",
    ghost:
      "text-noir-800 hover:bg-brand-100 focus:ring-brand-300 border border-transparent",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 border border-rose-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 rounded-sm text-[11px]",
    md: "px-5 py-2.5 rounded-sm text-xs",
    lg: "px-7 py-3.5 rounded-sm text-sm tracking-widest",
    icon: "p-2 rounded-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
