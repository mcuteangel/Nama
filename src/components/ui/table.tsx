import * as React from "react";

import { cn } from "@/lib/utils";
import { 
  ModernTable, 
  ModernTableHeader, 
  ModernTableBody, 
  ModernTableFooter, 
  ModernTableHead, 
  ModernTableRow, 
  ModernTableCell, 
  ModernTableCaption,
  type ModernTableProps,
  type ModernTableHeaderProps,
  type ModernTableBodyProps,
  type ModernTableFooterProps,
  type ModernTableRowProps,
  type ModernTableHeadProps,
  type ModernTableCellProps
} from "@/components/ui/modern-table";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & ModernTableProps
>(({ className, ...props }, ref) => (
  <ModernTable
    ref={ref}
    className={cn(
      "w-full caption-bottom text-sm",
      className,
    )}
    {...props}
  />
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & ModernTableHeaderProps
>(({ className, ...props }, ref) => (
  <ModernTableHeader
    ref={ref}
    className={cn(
      "[&_tr]:border-b",
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & ModernTableBodyProps
>(({ className, ...props }, ref) => (
  <ModernTableBody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0",
      className,
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & ModernTableFooterProps
>(({ className, ...props }, ref) => (
  <ModernTableFooter
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & ModernTableRowProps
>(({ className, ...props }, ref) => (
  <ModernTableRow
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & ModernTableHeadProps
>(({ className, ...props }, ref) => (
  <ModernTableHead
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & ModernTableCellProps
>(({ className, ...props }, ref) => (
  <ModernTableCell
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <ModernTableCaption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};