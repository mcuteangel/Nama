import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { GlassButton, type GlassButtonProps } from "./glass-button";
import { buttonVariants } from "./button-variants";

// Map legacy variants to glass variants
const mapVariantToGlass = (variant: string | null | undefined): GlassButtonProps['variant'] => {
  const variantMap: Record<string, GlassButtonProps['variant']> = {
    default: 'glass',
    destructive: 'glass',
    outline: 'glass',
    secondary: 'glass',
    ghost: 'glass',
    link: 'glass'
  };
  
  return variant ? variantMap[variant] || 'glass' : 'glass';
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  hoverEffect?: "lift" | "glow" | "scale" | "none";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, hoverEffect = "lift", ...props }, ref) => {
    // If asChild is true, we need to use the legacy implementation
    if (asChild) {
      const Comp = Slot;
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size }),
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }
    
    // Otherwise, use the glass button
    const glassVariant = mapVariantToGlass(variant);
    
    return (
      <GlassButton
        ref={ref}
        variant={glassVariant}
        size={size}
        effect={hoverEffect}
        className={className}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };