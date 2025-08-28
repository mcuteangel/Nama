import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";

import { cn, applyGlobalStyles, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyHoverEffect } from "@/lib/utils";
import { GlassEffect, GradientType, HoverEffect } from "@/types/global-style-types";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500",
        warning:
          "border-yellow-500/50 text-yellow-500 dark:border-yellow-500 [&>svg]:text-yellow-500",
        info:
          "border-blue-500/50 text-blue-500 dark:border-blue-500 [&>svg]:text-blue-500",
        glass: "border border-white/30 backdrop-blur-sm",
        neomorphism: "border border-white/30 shadow-neumorphism",
        gradient: "border-0 text-white",
      },
      glassEffect: {
        none: "",
        glass: "backdrop-blur-md bg-white/30 dark:bg-gray-700/30 border border-white/30 dark:border-gray-600/30",
        glassAdvanced: "backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border border-white/20 dark:border-gray-700/20 shadow-glass",
        glassCard: "backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/10 dark:border-gray-800/10 shadow-glass-card",
      },
      gradient: {
        none: "",
        primary: "bg-gradient-primary",
        ocean: "bg-gradient-ocean",
        sunset: "bg-gradient-sunset",
        success: "bg-gradient-success",
        info: "bg-gradient-info",
        fire: "bg-gradient-fire",
        royal: "bg-gradient-royal",
        mint: "bg-gradient-mint",
        purple: "bg-gradient-purple",
      },
      effect: {
        none: "",
        lift: "hover:-translate-y-0.5",
        glow: "hover:shadow-glow",
        scale: "hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
      effect: "none",
      glassEffect: "none",
      gradient: "none",
    },
  },
);

const iconMap = {
  default: Info,
  destructive: CircleX,
  success: CircleCheck,
  warning: CircleAlert,
  info: Info,
  glass: Info,
  neomorphism: Info,
  gradient: Info,
};

export interface ModernAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  hoverEffect?: HoverEffect;
  transition?: boolean;
  focusRing?: boolean;
}

const ModernAlert = React.forwardRef<
  HTMLDivElement,
  ModernAlertProps
>(({ 
  className, 
  variant, 
  effect,
  glassEffect = "none",
  gradientType = "none",
  hoverEffect = "none",
  transition = true,
  focusRing = false,
  ...props 
}, ref) => {
  const shouldApplyGlass = variant === "glass" || glassEffect !== "none";
  const shouldApplyNeomorphism = variant === "neomorphism";
  const shouldApplyGradient = variant === "gradient" || gradientType !== "none";
  
  const IconComponent = iconMap[variant || "default"];
  
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertVariants({ variant, effect, glassEffect, gradient: gradientType }),
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        applyGlobalStyles(className, {
          transition,
          focusRing
        }),
        applyHoverEffect(hoverEffect)
      )}
      {...props}
    >
      <IconComponent className="h-4 w-4" />
      {props.children}
    </div>
  );
});
ModernAlert.displayName = "ModernAlert";

const ModernAlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
ModernAlertTitle.displayName = "ModernAlertTitle";

const ModernAlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
ModernAlertDescription.displayName = "ModernAlertDescription";

export { ModernAlert, ModernAlertTitle, ModernAlertDescription };