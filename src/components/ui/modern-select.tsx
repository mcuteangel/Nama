import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn, applyGlassEffect, applyGradientEffect } from "@/lib/utils";

const ModernSelect = SelectPrimitive.Root;

const ModernSelectGroup = SelectPrimitive.Group;

const ModernSelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, children, ...props }, ref) => {
  // Determine if we're in RTL mode
  const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
  
  return (
    <SelectPrimitive.Value
      ref={ref}
      className={cn("text-start", className)}
      style={{ textAlign: isRTL ? 'right' : 'left', width: '100%', direction: isRTL ? 'rtl' : 'ltr' }}
      {...props}
    >
      {children}
    </SelectPrimitive.Value>
  );
});
ModernSelectValue.displayName = SelectPrimitive.Value.displayName;

interface ModernSelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  variant?: "default" | "glass" | "neomorphism" | "gradient";
  gradientType?: "primary" | "ocean" | "sunset" | "success" | "info" | "warning" | "danger" | "forest";
  size?: "sm" | "md" | "lg";
}

const ModernSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  ModernSelectTriggerProps
>(({ className, variant = "default", gradientType = "primary", size = "md", children, ...props }, ref) => {
  // Determine if we're in RTL mode
  const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
  
  const sizes = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm",
    lg: "h-12 text-base"
  };

  const baseClasses = "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background ps-4 pe-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 text-start";

  const variantClasses = {
    default: "bg-background border border-input focus:border-primary",
    glass: applyGlassEffect(""),
    neomorphism: "neomorphism",
    gradient: `${applyGradientEffect("", gradientType)} text-white border-0`
  };

  // Focus effect classes
  const focusClasses = {
    default: "focus:ring-2 focus:ring-ring focus:ring-offset-2",
    glass: "focus:ring-2 focus:ring-primary/50 focus:ring-offset-0",
    neomorphism: "focus:ring-2 focus:ring-primary/50 focus:ring-offset-0",
    gradient: "focus:ring-2 focus:ring-white/50 focus:ring-offset-0"
  };

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        baseClasses,
        sizes[size],
        variantClasses[variant],
        focusClasses[variant],
        "transition-all duration-300 ease-in-out",
        "[text-align:inherit]",
        className,
      )}
      style={{
        textAlign: isRTL ? 'right' : 'left',
        direction: isRTL ? 'rtl' : 'ltr'
      }}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50 ms-2 flex-shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
ModernSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const ModernSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
ModernSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const ModernSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
ModernSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

interface ModernSelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  variant?: "default" | "glass" | "neomorphism" | "gradient";
  gradientType?: "primary" | "ocean" | "sunset" | "success" | "info" | "warning" | "danger" | "forest";
}

const ModernSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  ModernSelectContentProps
>(({ className, variant = "default", gradientType = "primary", children, position = "popper", ...props }, ref) => {
  // Determine if we're in RTL mode
  const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
  
  const variantClasses = {
    default: "bg-popover text-popover-foreground border border-input",
    glass: applyGlassEffect(""),
    neomorphism: "neomorphism bg-background",
    gradient: `${applyGradientEffect("", gradientType)} text-white border-0`
  };

  return (
    <SelectPrimitive.Portal>
      <div style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 text-start",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
            variantClasses[variant],
            className,
          )}
          style={{
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left'
          }}
          position={position}
          {...props}
        >
        <ModernSelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <ModernSelectScrollDownButton />
        </SelectPrimitive.Content>
      </div>
    </SelectPrimitive.Portal>
  );
});
ModernSelectContent.displayName = SelectPrimitive.Content.displayName;

const ModernSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  // Determine if we're in RTL mode
  const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
  
  return (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 ps-8 pe-2 text-sm font-semibold text-start", className)}
    style={{ textAlign: isRTL ? 'right' : 'left' }}
    {...props}
  />
  );
});
ModernSelectLabel.displayName = SelectPrimitive.Label.displayName;

interface ModernSelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  variant?: "default" | "glass" | "neomorphism" | "gradient";
  gradientType?: "primary" | "ocean" | "sunset" | "success" | "info" | "warning" | "danger" | "forest";
}

const ModernSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  ModernSelectItemProps
>(({ className, variant = "default", gradientType = "primary", children, ...props }, ref) => {
  // Determine if we're in RTL mode
  const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
  const variantClasses = {
    default: "focus:bg-accent focus:text-accent-foreground",
    glass: "focus:bg-opacity-20 focus:bg-white",
    neomorphism: "focus:bg-accent focus:text-accent-foreground",
    gradient: "focus:bg-white/20"
  };

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 ps-8 pe-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-start",
        variantClasses[variant],
        "transition-colors duration-200",
        className,
      )}
      {...props}
    >
      <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText style={{ textAlign: isRTL ? 'right' : 'left', width: '100%', direction: isRTL ? 'rtl' : 'ltr' }}>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
ModernSelectItem.displayName = SelectPrimitive.Item.displayName;

const ModernSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
ModernSelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  ModernSelect,
  ModernSelectGroup,
  ModernSelectValue,
  ModernSelectTrigger,
  ModernSelectContent,
  ModernSelectLabel,
  ModernSelectItem,
  ModernSelectSeparator,
  ModernSelectScrollUpButton,
  ModernSelectScrollDownButton,
};