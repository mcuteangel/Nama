import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn - Class name merger with Tailwind CSS conflict resolution
 * This is the primary utility for combining class names in components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * applyGlobalStyles - Utility to ensure components use global style variables
 * This function adds common global style classes to components
 * @param className - Custom class names to merge
 * @param options - Options for which global styles to apply
 */
export function applyGlobalStyles(
  className: string | undefined,
  options: {
    transition?: boolean;
    focusRing?: boolean;
    disabledState?: boolean;
    darkModeTransition?: boolean;
  } = {}
) {
  const {
    transition = true,
    focusRing = true,
    disabledState = true,
    darkModeTransition = true
  } = options;

  const globalClasses = [
    // Base transition for all interactive elements
    transition && "transition-all duration-300 ease-in-out",
    
    // Focus ring for accessibility
    focusRing && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    
    // Disabled state styling
    disabledState && "disabled:pointer-events-none disabled:opacity-50",
    
    // Dark mode transition
    darkModeTransition && "dark-mode-transition"
  ].filter(Boolean).join(" ");

  return cn(globalClasses, className);
}

/**
 * getGlobalVariantClasses - Helper to apply global variant styles
 * @param variant - The variant type
 * @param variantsMap - Map of variants to class names
 * @param defaultVariant - Default variant to use
 */
export function getGlobalVariantClasses<T extends string>(
  variant: T | undefined | null,
  variantsMap: Record<T, string>,
  defaultVariant: T
): string {
  const effectiveVariant = variant || defaultVariant;
  return variantsMap[effectiveVariant] || variantsMap[defaultVariant];
}

/**
 * applyGlassEffect - Apply glassmorphism effect using global variables
 * @param className - Custom class names to merge
 * @param intensity - Intensity of the glass effect
 */
export function applyGlassEffect(
  className: string | undefined,
  intensity: "light" | "medium" | "strong" = "medium"
) {
  const glassClasses = {
    light: "glass",
    medium: "glass-advanced",
    strong: "glass-card"
  };

  return cn(glassClasses[intensity], className);
}

/**
 * applyNeomorphismEffect - Apply neomorphism effect using global variables
 * @param className - Custom class names to merge
 * @param pressed - Whether to apply pressed state
 */
export function applyNeomorphismEffect(
  className: string | undefined,
  pressed: boolean = false
) {
  return cn(pressed ? "neomorphism-pressed" : "neomorphism", className);
}

/**
 * applyGradientEffect - Apply gradient effects using global variables
 * @param className - Custom class names to merge
 * @param gradientType - Type of gradient to apply
 */
export function applyGradientEffect(
  className: string | undefined,
  gradientType: "primary" | "ocean" | "sunset" | "success" | "info" | "warning" | "danger" | "forest" = "primary"
) {
  const gradientClass = `bg-gradient-${gradientType}`;
  return cn(gradientClass, className);
}

/**
 * applyHoverEffect - Apply hover effects using global variables
 * @param className - Custom class names to merge
 * @param effect - Type of hover effect to apply
 */
export function applyHoverEffect(
  className: string | undefined,
  effect: "lift" | "glow" | "scale" | "none" = "lift"
) {
  const effectClasses = {
    lift: "hover-lift",
    glow: "hover-glow",
    scale: "hover:scale-105",
    none: ""
  };

  return cn(effectClasses[effect], className);
}

/**
 * applyAnimation - Apply animations using global variables
 * @param className - Custom class names to merge
 * @param animation - Type of animation to apply
 */
export function applyAnimation(
  className: string | undefined,
  animation: "fade-in-up" | "fade-in-down" | "fade-in-left" | "fade-in-right" | "scale-in" | "scale-out" | "floating" | "pulse-glow" | "none" = "none"
) {
  if (animation === "none") return className;
  return cn(animation, className);
}