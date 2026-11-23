import { cn } from "@/lib/utils";

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const baseStyles = "inline-flex items-center font-medium uppercase tracking-wider rounded-full";

  const variants = {
    default: "bg-noir-100 text-noir-800 border border-noir-200",
    new: "bg-noir-900 text-white",
    sale: "bg-rose-600 text-white",
    gold: "bg-brand-100 text-brand-800 border border-brand-300",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    outline: "border border-neutral-300 text-neutral-700 bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-xs font-semibold",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
