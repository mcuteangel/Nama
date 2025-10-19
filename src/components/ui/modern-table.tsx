import * as React from "react";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyHoverEffect } from "@/lib/utils";
import { GlassEffect, GradientType, HoverEffect } from "@/types/global-style-types";

// Helper function to safely cast string to GlassEffect type (excluding "none")
const toGlassEffectVariant = (value: string): "default" | "advanced" | "card" | "background" | "button" => {
  const validValues: ("default" | "advanced" | "card" | "background" | "button")[] = ["default", "advanced", "card", "background", "button"];
  return validValues.includes(value as any) ? (value as any) : "default";
};

// Helper function to safely cast string to GradientType (excluding "none")
const toGradientTypeValue = (value: string): "primary" | "ocean" | "sunset" | "success" | "info" | "warning" | "danger" | "forest" => {
  const validValues: ("primary" | "ocean" | "sunset" | "success" | "info" | "warning" | "danger" | "forest")[] = ["primary", "ocean", "sunset", "success", "info", "warning", "danger", "forest"];
  return validValues.includes(value as any) ? (value as any) : "primary";
};

// Helper function to safely cast string to HoverEffect type
const toHoverEffectValue = (value: string): "lift" | "glow" | "scale" | "none" => {
  const validValues: ("lift" | "glow" | "scale" | "none")[] = ["lift", "glow", "scale", "none"];
  return validValues.includes(value as any) ? (value as any) : "lift";
};

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
          shouldApplyGlass && applyGlassEffect(undefined, { variant: toGlassEffectVariant(glassEffect) }),
          shouldApplyNeomorphism && applyNeomorphismEffect(undefined, false),
          shouldApplyGradient && applyGradientEffect(undefined, toGradientTypeValue(gradientType)),
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
        shouldApplyGlass && applyGlassEffect(undefined, { variant: toGlassEffectVariant(glassEffect) }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined, false),
        shouldApplyGradient && applyGradientEffect(undefined, toGradientTypeValue(gradientType)),
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
        shouldApplyGlass && applyGlassEffect(undefined, { variant: toGlassEffectVariant(glassEffect) }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined, false),
        shouldApplyGradient && applyGradientEffect(undefined, toGradientTypeValue(gradientType)),
        applyHoverEffect(undefined, toHoverEffectValue(hoverEffect)),
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
        shouldApplyGlass && applyGlassEffect(undefined, { variant: toGlassEffectVariant(glassEffect) }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined, false),
        shouldApplyGradient && applyGradientEffect(undefined, toGradientTypeValue(gradientType)),
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
        shouldApplyGlass && applyGlassEffect(undefined, { variant: toGlassEffectVariant(glassEffect) }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined, false),
        shouldApplyGradient && applyGradientEffect(undefined, toGradientTypeValue(gradientType)),
        applyHoverEffect(undefined, toHoverEffectValue(hoverEffect)),
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
        shouldApplyGlass && applyGlassEffect(undefined, { variant: toGlassEffectVariant(glassEffect) }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined, false),
        shouldApplyGradient && applyGradientEffect(undefined, toGradientTypeValue(gradientType)),
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
        shouldApplyGlass && applyGlassEffect(undefined, { variant: toGlassEffectVariant(glassEffect) }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined, false),
        shouldApplyGradient && applyGradientEffect(undefined, toGradientTypeValue(gradientType)),
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

export type ModernTableProps = React.HTMLAttributes<HTMLTableElement> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
};

export type ModernTableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
};

export type ModernTableBodyProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
  hoverEffect?: HoverEffect;
};

export type ModernTableFooterProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
};

export type ModernTableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
  hoverEffect?: HoverEffect;
};

export type ModernTableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
};

export type ModernTableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
};

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