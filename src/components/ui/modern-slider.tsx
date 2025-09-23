import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export interface ModernSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  showThumb?: boolean;
  showRange?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  className?: string;
}

/**
 * ModernSlider - کامپوننت اسلایدر مدرن
 * @param variant - نوع ظاهری
 * @param size - اندازه
 * @param showThumb - نمایش دستگیره
 * @param showRange - نمایش محدوده
 * @param showTicks - نمایش نشانگرها
 * @param tickCount - تعداد نشانگرها
 */
const ModernSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  ModernSliderProps
>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      showThumb = true,
      showRange = true,
      showTicks = false,
      tickCount = 5,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    const variants = {
      default: "bg-gray-200",
      primary: "bg-primary/20",
      secondary: "bg-secondary/20",
      success: "bg-success/20",
      warning: "bg-warning/20",
      error: "bg-destructive/20",
    };

    const rangeVariants = {
      default: "bg-gray-600",
      primary: "bg-primary",
      secondary: "bg-secondary",
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-destructive",
    };

    const thumbSizes = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };

    const thumbVariants = {
      default: "border-gray-600 bg-white",
      primary: "border-primary bg-white",
      secondary: "border-secondary bg-white",
      success: "border-success bg-white",
      warning: "border-warning bg-white",
      error: "border-destructive bg-white",
    };

    // ایجاد تیک‌ها
    const ticks = [];
    if (showTicks && tickCount > 0) {
      for (let i = 0; i <= tickCount; i++) {
        const position = (i / tickCount) * 100;
        ticks.push(
          <div
            key={i}
            className="absolute top-1/2 h-1 w-px -translate-y-1/2 bg-gray-300"
            style={{ left: `${position}%` }}
          />
        );
      }
    }

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative w-full grow overflow-hidden rounded-full",
            sizes[size],
            variants[variant]
          )}
        >
          {showRange && (
            <SliderPrimitive.Range
              className={cn(
                "absolute h-full rounded-full",
                rangeVariants[variant]
              )}
            />
          )}
          {showTicks && ticks}
        </SliderPrimitive.Track>
        {showThumb && (
          <SliderPrimitive.Thumb
            className={cn(
              "block rounded-full border-2 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              thumbSizes[size],
              thumbVariants[variant]
            )}
          />
        )}
      </SliderPrimitive.Root>
    );
  }
);
ModernSlider.displayName = SliderPrimitive.Root.displayName;

export { ModernSlider };

// استفاده نمونه:
// <ModernSlider 
//   defaultValue={[50]} 
//   max={100} 
//   step={1} 
//   variant="primary"
//   size="md"
//   showThumb
//   showRange
//   showTicks
//   tickCount={5}
// />
