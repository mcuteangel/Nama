import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyHoverEffect } from "@/lib/utils";
import { GlassEffect, GradientType, HoverEffect } from "@/types/global-style-types";
import { GlassButton } from "@/components/ui/glass-button";

const ModernPagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
ModernPagination.displayName = "ModernPagination";

const ModernPaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
ModernPaginationContent.displayName = "ModernPaginationContent";

const ModernPaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
ModernPaginationItem.displayName = "ModernPaginationItem";

type ModernPaginationLinkProps = {
  isActive?: boolean;
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
  hoverEffect?: HoverEffect;
} & React.ComponentProps<"a">;

const ModernPaginationLink = ({
  className,
  isActive,
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  hoverEffect = "lift",
  ...props
}: ModernPaginationLinkProps) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10" 
          : "hover:bg-muted h-10 w-10",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        applyHoverEffect(hoverEffect),
        className,
      )}
      {...props}
    />
  );
};
ModernPaginationLink.displayName = "ModernPaginationLink";

const ModernPaginationPrevious = ({
  className,
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  hoverEffect = "lift",
  ...props
}: React.ComponentProps<typeof ModernPaginationLink>) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <ModernPaginationLink
      aria-label="Go to previous page"
      className={cn(
        "gap-1 pl-2.5",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        applyHoverEffect(hoverEffect),
        className,
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </ModernPaginationLink>
  );
};
ModernPaginationPrevious.displayName = "ModernPaginationPrevious";

const ModernPaginationNext = ({
  className,
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  hoverEffect = "lift",
  ...props
}: React.ComponentProps<typeof ModernPaginationLink>) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <ModernPaginationLink
      aria-label="Go to next page"
      className={cn(
        "gap-1 pr-2.5",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        applyHoverEffect(hoverEffect),
        className,
      )}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </ModernPaginationLink>
  );
};
ModernPaginationNext.displayName = "ModernPaginationNext";

const ModernPaginationEllipsis = ({
  className,
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props
}: React.ComponentProps<"span"> & {
  glassEffect?: GlassEffect;
  gradientType?: GradientType;
  neomorphism?: boolean;
}) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 items-center justify-center",
        shouldApplyGlass && applyGlassEffect(glassEffect),
        shouldApplyNeomorphism && applyNeomorphismEffect(),
        shouldApplyGradient && applyGradientEffect(gradientType),
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
};
ModernPaginationEllipsis.displayName = "ModernPaginationEllipsis";

export {
  ModernPagination,
  ModernPaginationContent,
  ModernPaginationEllipsis,
  ModernPaginationItem,
  ModernPaginationLink,
  ModernPaginationNext,
  ModernPaginationPrevious,
};