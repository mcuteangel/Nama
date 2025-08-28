import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect } from "@/lib/utils";
import { GlassEffect, GradientType } from "@/types/global-style-types";

function ModernSkeleton({
  className,
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
}) {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        className,
      )}
      {...props}
    />
  );
}

export { ModernSkeleton };