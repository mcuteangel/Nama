import * as React from "react";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyHoverEffect } from "@/lib/utils";
import { GlassEffect, GradientType, HoverEffect } from "@/types/global-style-types";

const ModernTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-sm",
          shouldApplyGlass && applyGlassEffect(glassEffect),
          shouldApplyNeomorphism && applyNeomorphismEffect(),
          shouldApplyGradient && applyGradientEffect(gradientType),
          className,
        )}
        {...props}
      />
    </div>
  );
});
ModernTable.displayName = "ModernTable";

const ModernTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <thead 
      ref={ref} 
      className={cn(
        "[&_tr]:border-b",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        className,
      )} 
      {...props} 
    />
  );
});
ModernTableHeader.displayName = "ModernTableHeader";

const ModernTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
    hoverEffect?: HoverEffect;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  hoverEffect = "none",
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <tbody
      ref={ref}
      className={cn(
        "[&_tr:last-child]:border-0",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        applyHoverEffect(hoverEffect),
        className,
      )}
      {...props}
    />
  );
});
ModernTableBody.displayName = "ModernTableBody";

const ModernTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <tfoot
      ref={ref}
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        className,
      )}
      {...props}
    />
  );
});
ModernTableFooter.displayName = "ModernTableFooter";

const ModernTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    glassEffect?: GlassEffect;
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
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        applyHoverEffect(hoverEffect),
        className,
      )}
      {...props}
    />
  );
});
ModernTableRow.displayName = "ModernTableRow";

const ModernTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        className,
      )}
      {...props}
    />
  );
});
ModernTableHead.displayName = "ModernTableHead";

const ModernTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props 
}, ref) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        className,
      )}
      {...props}
    />
  );
});
ModernTableCell.displayName = "ModernTableCell";

const ModernTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModernTableCaption.displayName = "ModernTableCaption";

export {
  ModernTable,
  ModernTableHeader,
  ModernTableBody,
  ModernTableFooter,
  ModernTableHead,
  ModernTableRow,
  ModernTableCell,
  ModernTableCaption,
};