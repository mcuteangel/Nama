import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border",
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
      size: {
        default: "h-6 px-3 py-1",
        sm: "h-5 px-2 py-0.5 text-xs",
        lg: "h-8 px-4 py-1.5 text-sm",
      },
      effect: {
        none: "",
        lift: "hover:-translate-y-0.5",
        glow: "hover:shadow-glow",
        scale: "hover:scale-105",
        pulse: "hover:animate-pulse",
        ripple: "hover:animate-ripple",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      effect: "none",
      glassEffect: "none",
      gradient: "none",
    },
  },
);
