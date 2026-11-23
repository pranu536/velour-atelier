"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = "",
      containerClassName = "",
      id,
      type = "text",
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("w-full flex flex-col space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-wider text-neutral-700 flex items-center justify-between"
          >
            <span>
              {label} {required && <span className="text-rose-500">*</span>}
            </span>
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={cn(
            "w-full px-3.5 py-2.5 bg-white text-noir-900 placeholder:text-neutral-400 border border-neutral-200 text-sm transition duration-150 ease-in-out focus:border-noir-900 focus:outline-none focus:ring-1 focus:ring-noir-900 disabled:bg-neutral-50 disabled:cursor-not-allowed",
            error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-neutral-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

