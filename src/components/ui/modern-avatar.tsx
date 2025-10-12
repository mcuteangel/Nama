import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect } from "@/lib/utils";
import { GlassEffect, GradientType } from "@/types/global-style-types";

export type ModernAvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
  pulse?: boolean;
  floating?: boolean;
};

const ModernAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  ModernAvatarProps
>(({
  className,
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  pulse = false,
  floating = false,
  ...props
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        pulse && "animate-pulse",
        floating && "animate-floating",
        className,
      )}
      {...props}
    />
  );
});
ModernAvatar.displayName = AvatarPrimitive.Root.displayName;

const ModernAvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
ModernAvatarImage.displayName = AvatarPrimitive.Image.displayName;

export type ModernAvatarFallbackProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
};

const ModernAvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  ModernAvatarFallbackProps
>(({
  className,
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        className,
      )}
      {...props}
    />
  );
});
ModernAvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { ModernAvatar, ModernAvatarImage, ModernAvatarFallback };