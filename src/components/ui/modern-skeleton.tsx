import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect } from "@/lib/utils";
import { GlassEffect, GradientType } from "@/types/global-style-types";

export type ModernSkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
};

function ModernSkeleton({
  className,
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props
}: ModernSkeletonProps) {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;

  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        className,
      )}
      {...props}
    />
  );
}

export { ModernSkeleton };