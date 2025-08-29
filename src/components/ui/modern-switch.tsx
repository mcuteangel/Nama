import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyHoverEffect } from "@/lib/utils";
import type { GlassEffect, GradientType, HoverEffect } from "../../types/global-style-types.ts";

const ModernSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
    hoverEffect?: HoverEffect;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  hoverEffect = "lift",
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        shouldApplyGlass && applyGlassEffect(undefined, glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        applyHoverEffect(undefined, hoverEffect),
        className,
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:ltr:translate-x-5 data-[state=unchecked]:ltr:translate-x-0 data-[state=checked]:rtl:-translate-x-5 data-[state=unchecked]:rtl:translate-x-0",
          shouldApplyGlass && applyGlassEffect(undefined, glassEffect),
          shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
          shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        )}
      />
    </SwitchPrimitives.Root>
  );
});
ModernSwitch.displayName = SwitchPrimitives.Root.displayName;

export { ModernSwitch };