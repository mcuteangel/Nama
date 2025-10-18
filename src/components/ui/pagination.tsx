import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { 
  ModernPagination, 
  ModernPaginationContent, 
  ModernPaginationEllipsis, 
  ModernPaginationItem, 
  ModernPaginationLink, 
  ModernPaginationNext, 
  ModernPaginationPrevious,
  type ModernPaginationLinkProps
} from "@/components/ui/modern-pagination";

const Pagination = ModernPagination;

const PaginationContent = ModernPaginationContent;

const PaginationItem = ModernPaginationItem;

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a"> &
  ModernPaginationLinkProps;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <ModernPaginationLink
    aria-current={isActive ? "page" : undefined}
    size={size}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  return (
    <ModernPaginationPrevious
      aria-label={t('pagination.go_to_previous')}
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{t('pagination.previous')}</span>
    </ModernPaginationPrevious>
  );
};
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  return (
    <ModernPaginationNext
      aria-label={t('pagination.go_to_next')}
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>{t('pagination.next')}</span>
      <ChevronRight className="h-4 w-4" />
    </ModernPaginationNext>
  );
};
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => {
  const { t } = useTranslation();
  return (
    <ModernPaginationEllipsis
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{t('pagination.more_pages')}</span>
    </ModernPaginationEllipsis>
  );
};
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};