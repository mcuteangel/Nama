import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, applyGlobalStyles, applyAnimation } from "@/lib/utils";
import { ModernBadge, type ModernBadgeProps } from "@/components/ui/modern-badge";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends Omit<ModernBadgeProps, 'variant' | 'size'>,
    VariantProps<typeof badgeVariants> {
  animation?: "fade-in-up" | "fade-in-down" | "scale-in" | "none";
  transition?: boolean;
  focusRing?: boolean;
}

function Badge({ 
  className, 
  variant, 
  animation = "none",
  transition = true,
  focusRing = false,
  ...props 
}: BadgeProps) {
  // Map legacy variants to modern equivalents
  const modernVariant = variant || "default";
  
  return (
    <ModernBadge
      variant={modernVariant}
      className={cn(
        // Preserve any custom className passed in
        className,
      )}
      animation={animation}
      transition={transition}
      focusRing={focusRing}
      {...props}
    />
  );
}

export { Badge, badgeVariants };