import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ModernButton, type ModernButtonProps } from "./modern-button";
import { buttonVariants } from "./button-variants";

// Map legacy variants to modern variants
const mapVariantToModern = (variant: string | null | undefined): ModernButtonProps['variant'] => {
  const variantMap: Record<string, ModernButtonProps['variant']> = {
    default: 'default',
    destructive: 'destructive',
    outline: 'outline',
    secondary: 'secondary',
    ghost: 'ghost',
    link: 'link'
  };
  
  return variant ? variantMap[variant] || 'default' : 'default';
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
    
    // Otherwise, use the modern button
    const modernVariant = mapVariantToModern(variant);
    
    return (
      <ModernButton
        ref={ref}
        variant={modernVariant}
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