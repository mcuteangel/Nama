import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ModernButton, type ModernButtonProps } from "./modern-button";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

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

export { Button, buttonVariants };