import * as React from "react";

import { cn, applyGlobalStyles, applyGlassEffect, applyGradientEffect } from "@/lib/utils";

export interface ModernTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "glass" | "neomorphism" | "gradient";
  gradientType?: "primary" | "ocean" | "sunset" | "success" | "info" | "warning" | "danger" | "forest";
  size?: "sm" | "md" | "lg";
  transition?: boolean;
  focusRing?: boolean;
  disabledState?: boolean;
}

const ModernTextarea = React.forwardRef<HTMLTextAreaElement, ModernTextareaProps>(
  ({ 
    className, 
    variant = "default",
    gradientType = "primary",
    size = "md",
    transition = true, 
    focusRing = true, 
    disabledState = true, 
    ...props 
  }, ref) => {
    const sizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base"
    };

    const baseClasses = "flex min-h-[80px] w-full rounded-xl border border-input bg-background ps-4 pe-4 py-3 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed";

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
      <textarea
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

ModernTextarea.displayName = "ModernTextarea";

export { ModernTextarea };