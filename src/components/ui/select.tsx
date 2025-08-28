import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { 
  ModernSelect, 
  ModernSelectGroup, 
  ModernSelectValue, 
  ModernSelectTrigger, 
  ModernSelectContent, 
  ModernSelectLabel, 
  ModernSelectItem, 
  ModernSelectSeparator, 
  ModernSelectScrollUpButton, 
  ModernSelectScrollDownButton 
} from "@/components/ui/modern-select";

const Select = ModernSelect;

const SelectGroup = ModernSelectGroup;

const SelectValue = ModernSelectValue;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  // Determine if we're in RTL mode
  const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
  
  return (
  <ModernSelectTrigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background ps-3 pe-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 text-start",
      className,
    )}
    style={{
      textAlign: isRTL ? 'right' : 'left',
      direction: isRTL ? 'rtl' : 'ltr'
    }}
    {...props}
  >
    {children}
  </ModernSelectTrigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = ModernSelectScrollUpButton;

const SelectScrollDownButton = ModernSelectScrollDownButton;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  // Determine if we're in RTL mode
  const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
  
  return (
  <ModernSelectContent
    ref={ref}
    position={position}
    className={cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 text-start",
      position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
      className,
    )}
    style={{
      direction: isRTL ? 'rtl' : 'ltr',
      textAlign: isRTL ? 'right' : 'left'
    }}
    {...props}
  >
    {children}
  </ModernSelectContent>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = ModernSelectLabel;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  // Determine if we're in RTL mode
  const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;
  
  return (
  <ModernSelectItem
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 ps-8 pe-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-start",
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
  </ModernSelectItem>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = ModernSelectSeparator;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};