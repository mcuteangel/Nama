import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ModernBadge, type ModernBadgeProps } from "@/components/ui/modern-badge";
import { badgeVariants } from "@/components/ui/badge-variants";

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

export { Badge }
