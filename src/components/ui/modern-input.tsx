import * as React from "react";

import { cn, applyGlobalStyles, applyGlassEffect, applyGradientEffect } from "@/lib/utils";

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "glass" | "neomorphism" | "gradient";
  gradientType?: "primary" | "ocean" | "sunset" | "success" | "info" | "warning" | "danger" | "forest";
  size?: "sm" | "md" | "lg";
  transition?: boolean;
  focusRing?: boolean;
  disabledState?: boolean;
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ 
    className, 
    type, 
    variant = "default",
    gradientType = "primary",
    size = "md",
    transition = true, 
    focusRing = true, 
    disabledState = true, 
    ...props 
  }, ref) => {
    const sizes = {
      sm: "h-8 text-xs",
      md: "h-10 text-sm",
      lg: "h-12 text-base"
    };

    const baseClasses = "flex w-full rounded-xl border border-input bg-background ps-4 pe-4 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed";

    const variantClasses = {
      default: "bg-background border border-input focus:border-primary",
      glass: applyGlassEffect(""),
      neomorphism: "neomorphism",
      gradient: `${applyGradientEffect("", gradientType)} text-white border-0`
    };

    // Focus effect classes
    const focusClasses = {
      default: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      glass: "focus:ring-2 focus:ring-primary/50 focus:ring-offset-0",
      neomorphism: "focus:ring-2 focus:ring-primary/50 focus:ring-offset-0",
      gradient: "focus:ring-2 focus:ring-white/50 focus:ring-offset-0"
    };

    return (
      <input
        type={type}
        className={cn(
          baseClasses,
          sizes[size],
          variantClasses[variant],
          focusClasses[variant],
          applyGlobalStyles(className, {
            transition,
            focusRing: false, // We're handling focus manually
            disabledState
          })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

ModernInput.displayName = "ModernInput";

export { ModernInput };