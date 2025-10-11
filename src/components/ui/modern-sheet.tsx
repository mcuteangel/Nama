import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyAnimation } from "@/lib/utils";
import { GlassEffect, GradientType, AnimationType } from "@/types/global-style-types";

// Helper function to map GlassEffect to sheetVariants glassEffect values
function mapGlassEffectToVariant(glassEffect: GlassEffect | undefined): "none" | "default" | "advanced" | "card" | "background" | "button" {
  if (!glassEffect || glassEffect === "none") return "none";

  // Map GlassEffect values to sheetVariants values
  const mapping: Record<GlassEffect, "none" | "default" | "advanced" | "card" | "background" | "button"> = {
    "none": "none",
    "default": "default",
    "advanced": "advanced",
    "card": "card",
    "background": "background",
    "button": "button"
  };

  return mapping[glassEffect];
}

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> & {
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
    <SheetPrimitive.Overlay
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
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
      glassEffect: {
        none: "",
        glass: "backdrop-blur-md bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30",
        glassAdvanced: "backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border border-white/20 dark:border-gray-700/20 shadow-glass",
        glassCard: "backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/10 dark:border-gray-800/10 shadow-glass-card",
        default: "backdrop-blur-md bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30",
        advanced: "backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border border-white/20 dark:border-gray-700/20 shadow-glass",
        card: "backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/10 dark:border-gray-800/10 shadow-glass-card",
        background: "backdrop-blur-md bg-white/5 dark:bg-gray-900/5 border border-white/5 dark:border-gray-800/5",
        button: "backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border border-white/20 dark:border-gray-700/20 shadow-glass",
      },
      gradient: {
        none: "",
        primary: "bg-gradient-primary",
        ocean: "bg-gradient-ocean",
        sunset: "bg-gradient-sunset",
        success: "bg-gradient-success",
        info: "bg-gradient-info",
        warning: "bg-gradient-warning",
        danger: "bg-gradient-danger",
        fire: "bg-gradient-fire",
        royal: "bg-gradient-royal",
        mint: "bg-gradient-mint",
        purple: "bg-gradient-purple",
        forest: "bg-gradient-forest",
      },
    },
    defaultVariants: {
      side: "right",
      glassEffect: "glassCard",
      gradient: "none",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    Omit<VariantProps<typeof sheetVariants>, 'glassEffect'> {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
  animation?: AnimationType;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ 
  side = "right", 
  glassEffect = "card",
  gradientType = "none",
  neomorphism = false,
  animation = "scale-in",
  className, 
  children, 
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <SheetPortal>
      <SheetOverlay glassEffect={glassEffect ?? undefined} animation={animation} />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          sheetVariants({ side, glassEffect: mapGlassEffectToVariant(glassEffect), gradient: gradientType }),
          shouldApplyGlass && applyGlassEffect(glassEffect ?? undefined),
          shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
          shouldApplyGradient && applyGradientEffect(gradientType ?? undefined),
          applyAnimation(undefined, animation),
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
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
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
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
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};