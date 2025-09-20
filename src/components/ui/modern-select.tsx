import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";

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

// Modern Search Select Component

export interface ModernSearchSelectProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  variant?: "glass" | "neomorphism" | "gradient";
  gradientType?: "primary" | "ocean" | "sunset" | "success" | "warning" | "danger" | "info" | "forest";
}

export const ModernSearchSelect = React.forwardRef<
  HTMLButtonElement,
  ModernSearchSelectProps
>(({
  options,
  value,
  onValueChange,
  placeholder = "انتخاب کنید...",
  searchPlaceholder = "جستجو...",
  emptyMessage = "نتیجه‌ای یافت نشد",
  className,
  disabled = false,
  variant = "glass",
  gradientType = "primary",
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedOption = options.find(option => option.value === value);

  const getVariantClasses = () => {
    switch (variant) {
      case "glass":
        return "border-2 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm transition-all duration-300 ease-out focus:ring-4 focus:ring-primary-500/20 focus:border-primary-400 hover:bg-white/90 dark:hover:bg-neutral-800/90 hover:shadow-lg hover:shadow-primary-500/10 border-white/50 dark:border-gray-600/50";
      case "neomorphism":
        return "neomorphism transition-all duration-300 ease-out focus:ring-4 focus:ring-primary-500/20 focus:border-primary-400 hover:shadow-lg hover:shadow-primary-500/10";
      case "gradient":
        return `bg-gradient-to-r ${getGradientClasses()} text-white border-0 transition-all duration-300 ease-out focus:ring-4 focus:ring-white/50 focus:ring-offset-0 hover:shadow-lg hover:shadow-white/20`;
      default:
        return "";
    }
  };

  const getGradientClasses = () => {
    const gradients = {
      primary: "from-primary-500 to-primary-700",
      ocean: "from-blue-500 to-cyan-600",
      sunset: "from-orange-500 to-red-600",
      success: "from-green-500 to-emerald-600",
      warning: "from-yellow-500 to-orange-600",
      danger: "from-red-500 to-pink-600",
      info: "from-cyan-500 to-blue-600",
      forest: "from-green-600 to-teal-700"
    };
    return gradients[gradientType] || gradients.primary;
  };

  return (
    <div className="relative">
      <button
        ref={ref}
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-2xl px-6 py-4 text-left text-base font-medium",
          getVariantClasses(),
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedOption?.icon && (
            <div className="flex-shrink-0">
              {selectedOption.icon}
            </div>
          )}
          <span className={cn(
            "truncate",
            !selectedOption && "text-muted-foreground"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={20}
          className={cn(
            "flex-shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Search Input */}
          <div className="absolute top-full left-0 right-0 z-50 mt-2">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-background/80 backdrop-blur-sm border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border-2 bg-background/90 backdrop-blur-sm border-border shadow-lg">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onValueChange(option.value);
                      setOpen(false);
                      setSearchTerm("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors duration-200",
                      value === option.value && "bg-primary/10 text-primary"
                    )}
                  >
                    {option.icon && (
                      <div className="flex-shrink-0">
                        {option.icon}
                      </div>
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
                    {value === option.value && (
                      <Check size={16} className="flex-shrink-0 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

ModernSearchSelect.displayName = "ModernSearchSelect";