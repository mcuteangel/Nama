import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect, applyHoverEffect } from "@/lib/utils";
import { GlassEffect, GradientType, HoverEffect } from "@/types/global-style-types";

const ModernPagination = ({ className, ...props }: React.ComponentProps<"nav">) => {
  const { t } = useTranslation();
  return (
    <nav
      role="navigation"
      aria-label={t('pagination.navigation')}
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
};
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
  size?: "default" | "sm" | "lg" | "icon";
} & React.ComponentProps<"a">;

const ModernPaginationLink = ({
  className,
  isActive,
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  hoverEffect = "lift",
  size = "icon",
  ...props
}: ModernPaginationLinkProps) => {
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };
  
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "hover:bg-muted",
        sizeClasses[size],
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        applyHoverEffect(undefined, hoverEffect),
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
  const { t } = useTranslation();
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <ModernPaginationLink
      aria-label={t('pagination.go_to_previous')}
      className={cn(
        "gap-1 pl-2.5",
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        applyHoverEffect(undefined, hoverEffect),
        className,
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{t('pagination.previous')}</span>
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
  const { t } = useTranslation();
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <ModernPaginationLink
      aria-label={t('pagination.go_to_next')}
      className={cn(
        "gap-1 pr-2.5",
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        applyHoverEffect(undefined, hoverEffect),
        className,
      )}
      {...props}
    >
      <span>{t('pagination.next')}</span>
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
  const { t } = useTranslation();
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 items-center justify-center",
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{t('pagination.more_pages')}</span>
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

export type { ModernPaginationLinkProps };