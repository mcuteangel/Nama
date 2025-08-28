import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyAnimation } from "@/lib/utils";
import { GlassEffect, GradientType, AnimationType } from "@/types/global-style-types";

const ModernDialog = DialogPrimitive.Root;

const ModernDialogTrigger = DialogPrimitive.Trigger;

const ModernDialogPortal = DialogPrimitive.Portal;

const ModernDialogClose = DialogPrimitive.Close;

const ModernDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
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
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        applyAnimation(undefined, animation),
        className,
      )}
      {...props}
    />
  );
});
ModernDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ModernDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
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
  children, 
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <ModernDialogPortal>
      <ModernDialogOverlay glassEffect={glassEffect} animation={animation} />
      <DialogPrimitive.Content
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
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </ModernDialogPortal>
  );
});
ModernDialogContent.displayName = DialogPrimitive.Content.displayName;

const ModernDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
ModernDialogHeader.displayName = "ModernDialogHeader";

const ModernDialogFooter = ({
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
ModernDialogFooter.displayName = "ModernDialogFooter";

const ModernDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
ModernDialogTitle.displayName = DialogPrimitive.Title.displayName;

const ModernDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModernDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  ModernDialog,
  ModernDialogPortal,
  ModernDialogOverlay,
  ModernDialogClose,
  ModernDialogTrigger,
  ModernDialogContent,
  ModernDialogHeader,
  ModernDialogFooter,
  ModernDialogTitle,
  ModernDialogDescription,
};