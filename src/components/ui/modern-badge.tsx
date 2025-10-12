import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { cn, applyGlobalStyles, applyAnimation, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyHoverEffect } from "@/lib/utils";
import { GlassEffect, GradientType, HoverEffect, AnimationType } from "@/types/global-style-types";
import { badgeVariants } from "./badge-variants-modern";

export interface ModernBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof badgeVariants>, 'glassEffect'> {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  hoverEffect?: HoverEffect;
  animation?: AnimationType;
  transition?: boolean;
  focusRing?: boolean;
}

function ModernBadge({ 
  className, 
  variant, 
  size, 
  effect,
  glassEffect = "none",
  gradientType = "none",
  hoverEffect = "none",
  animation = "none",
  transition = true,
  focusRing = false,
  ...props 
}: ModernBadgeProps) {
  // Determine if we should apply glass effect
  const shouldApplyGlass = variant === "glass" || glassEffect !== "none";
  const shouldApplyNeomorphism = variant === "neomorphism";
  const shouldApplyGradient = variant === "gradient" || gradientType !== "none";
  
  return (
    <div 
      className={cn(
        badgeVariants({ 
          variant, 
          size, 
          effect, 
          glassEffect: glassEffect && ["glass", "glassAdvanced", "glassCard"].includes(glassEffect) ? glassEffect as "glass" | "glassAdvanced" | "glassCard" : "none",
          gradient: gradientType && ["primary", "ocean", "sunset", "success", "info", "fire", "royal", "mint", "purple"].includes(gradientType) ? gradientType as "primary" | "ocean" | "sunset" | "success" | "info" | "fire" | "royal" | "mint" | "purple" : "none"
        }),
        shouldApplyGlass && glassEffect !== "none" && ["default", "advanced", "card", "background", "button"].includes(glassEffect) && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && gradientType !== "none" && ["primary", "ocean", "sunset", "success", "info", "warning", "danger", "forest"].includes(gradientType) && applyGradientEffect(undefined, gradientType),
        applyGlobalStyles(className, {
          transition,
          focusRing
        }),
        applyAnimation(undefined, animation),
        applyHoverEffect(undefined, hoverEffect)
      )} 
      {...props} 
    />
  );
}

export { ModernBadge };