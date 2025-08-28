import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyAnimation } from "@/lib/utils";
import { GlassEffect, GradientType, AnimationType } from "@/types/global-style-types";
import { ModernButton, type ModernButtonProps } from "@/components/ui/modern-button";

const ModernAlertDialog = AlertDialogPrimitive.Root;

const ModernAlertDialogTrigger = AlertDialogPrimitive.Trigger;

const ModernAlertDialogPortal = AlertDialogPrimitive.Portal;

const ModernAlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> & {
    glassEffect?: GlassEffect;
    animation?: AnimationType;
  }
>(({ 
  className, 
  glassEffect = "glassAdvanced",
  animation = "fade-in",
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/80",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        applyAnimation(undefined, animation),
        className,
      )}
      {...props}
      ref={ref}
    />
  );
});
ModernAlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const ModernAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
    animation?: AnimationType;
  }
>(({ 
  className, 
  glassEffect = "glassCard",
  gradientType = "none",
  neomorphism = false,
  animation = "scale-in",
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <ModernAlertDialogPortal>
      <ModernAlertDialogOverlay glassEffect={glassEffect} animation={animation} />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
          shouldApplyGlass && applyGlassEffect(glassEffect),
          shouldApplyNeomorphism && applyNeomorphismEffect(),
          shouldApplyGradient && applyGradientEffect(gradientType),
          applyAnimation(undefined, animation),
          className,
        )}
        {...props}
      />
    </ModernAlertDialogPortal>
  );
});
ModernAlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const ModernAlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
ModernAlertDialogHeader.displayName = "ModernAlertDialogHeader";

const ModernAlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
ModernAlertDialogFooter.displayName = "ModernAlertDialogFooter";

const ModernAlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
ModernAlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const ModernAlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModernAlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const ModernAlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> & ModernButtonProps
>(({ className, ...props }, ref) => (
  <ModernButton
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
ModernAlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const ModernAlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> & ModernButtonProps
>(({ className, ...props }, ref) => (
  <ModernButton
    ref={ref}
    variant="outline"
    className={cn(className)}
    {...props}
  />
));
ModernAlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  ModernAlertDialog,
  ModernAlertDialogPortal,
  ModernAlertDialogOverlay,
  ModernAlertDialogTrigger,
  ModernAlertDialogContent,
  ModernAlertDialogHeader,
  ModernAlertDialogFooter,
  ModernAlertDialogTitle,
  ModernAlertDialogDescription,
  ModernAlertDialogAction,
  ModernAlertDialogCancel,
};