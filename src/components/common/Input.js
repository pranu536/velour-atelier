"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
      showPasswordToggle = true,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password" && showPasswordToggle;
    const computedType = isPasswordField ? (showPassword ? "text" : "password") : type;
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

        <div className="relative w-full">
          <input
            ref={ref}
            id={inputId}
            type={computedType}
            required={required}
            className={cn(
              "w-full px-3.5 py-2.5 bg-white text-noir-900 placeholder:text-neutral-400 border border-neutral-200 text-sm transition duration-150 ease-in-out focus:border-noir-900 focus:outline-none focus:ring-1 focus:ring-noir-900 disabled:bg-neutral-50 disabled:cursor-not-allowed",
              isPasswordField ? "pr-10" : "",
              error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "",
              className
            )}
            {...props}
          />

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-noir-900 focus:outline-none focus:text-noir-900 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

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
