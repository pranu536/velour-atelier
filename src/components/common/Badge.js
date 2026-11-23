import { cn } from "@/lib/utils";

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const baseStyles = "inline-flex items-center font-medium uppercase tracking-wider rounded-none text-[10px]";

  const variants = {
    default: "bg-[#F1EDE5] text-[#242424] border border-[#D8CDBD]",
    new: "bg-[#F8F6F1] text-[#242424] border border-[#D8CDBD] tracking-widest",
    bestseller: "bg-[#242424] text-white border border-[#242424] tracking-widest",
    sale: "bg-[#242424] text-white",
    gold: "bg-[#FAF8F5] text-[#7F6650] border border-[#D5C4B0]",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    danger: "bg-neutral-200 text-neutral-800 border border-neutral-300",
    outline: "border border-[#D8CDBD] text-[#242424] bg-white",
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

