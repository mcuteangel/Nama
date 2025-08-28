import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyAnimation } from "@/lib/utils";
import { GlassEffect, GradientType, AnimationType } from "@/types/global-style-types";

const ModernTooltipProvider = TooltipPrimitive.Provider;

const ModernTooltip = TooltipPrimitive.Root;

const ModernTooltipTrigger = TooltipPrimitive.Trigger;

const ModernTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
    animation?: AnimationType;
  }
>(({ 
  className, 
  glassEffect = "glassAdvanced",
  gradientType = "none",
  neomorphism = false,
  animation = "fade-in",
  sideOffset = 4, 
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        applyAnimation(undefined, animation),
        className,
      )}
      {...props}
    />
  );
});
ModernTooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { ModernTooltip, ModernTooltipTrigger, ModernTooltipContent, ModernTooltipProvider };