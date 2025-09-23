import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyHoverEffect } from "@/lib/utils";
import { GradientType, HoverEffect } from "@/types/global-style-types";

interface ModernRadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options?: Array<{ value: string; label: string }>;
}

const ModernRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  ModernRadioGroupProps
>(({ className, options, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    >
      {options
        ? options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 rtl:space-x-reverse">
              <ModernRadioGroupItem value={option.value} id={option.value} />
              <label htmlFor={option.value} className="text-sm font-medium leading-none">
                {option.label}
              </label>
            </div>
          ))
        : children}
    </RadioGroupPrimitive.Root>
  );
});
ModernRadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const ModernRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    glassEffect?: 'none' | 'default' | 'advanced' | 'card' | 'background' | 'button';
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
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect as any }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined, false),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        applyHoverEffect(undefined, hoverEffect),
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
ModernRadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { ModernRadioGroup, ModernRadioGroupItem };