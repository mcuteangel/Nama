// Modern UI Components
export * from './modern-card';
// export * from './modern-button';  // Removed to focus on glassmorphism buttons only
// export * from './modern-loader';  // Removed to avoid Skeleton conflict
export * from './modern-grid';
export {
  Toast as ModernToast,
  ToastProvider as ModernToastProvider,
  useToast as useModernToast,
  type ToastProps as ModernToastProps
} from './modern-toast';
export * from './modern-progress';
// Rename ModernTabs from modern-navigation to avoid conflict
export { ModernNavigation, ModernBreadcrumb } from './modern-navigation';
export { ModernTabs as ModernNavigationTabs } from './modern-navigation';
export * from './modern-input';
export * from './modern-textarea';
export * from './modern-select';

// Explicitly export Badge components to avoid conflicts
export { 
  Badge,
  type BadgeProps,
} from './badge';

export { 
  badgeVariants
} from './badge-variants';

export { 
  ModernBadge,
  type ModernBadgeProps,
  badgeVariants as modernBadgeVariants
} from './modern-badge';

export * from './modern-avatar';
export * from './modern-alert';
export * from './modern-dialog';

// Explicitly export ModernSheet components to avoid conflicts
export {
  Sheet as ModernSheet,
  SheetPortal as ModernSheetPortal,
  SheetOverlay as ModernSheetOverlay,
  SheetTrigger as ModernSheetTrigger,
  SheetClose as ModernSheetClose,
  SheetContent as ModernSheetContent,
  SheetHeader as ModernSheetHeader,
  SheetFooter as ModernSheetFooter,
  SheetTitle as ModernSheetTitle,
  SheetDescription as ModernSheetDescription,
} from './modern-sheet';

// Explicitly export traditional Sheet components with different names to avoid conflicts
export {
  Sheet as TraditionalSheet,
  SheetPortal as TraditionalSheetPortal,
  SheetOverlay as TraditionalSheetOverlay,
  SheetTrigger as TraditionalSheetTrigger,
  SheetClose as TraditionalSheetClose,
  SheetContent as TraditionalSheetContent,
  SheetHeader as TraditionalSheetHeader,
  SheetFooter as TraditionalSheetFooter,
  SheetTitle as TraditionalSheetTitle,
  SheetDescription as TraditionalSheetDescription,
} from './sheet';

// Export ModernTabs from modern-tabs with a specific name to avoid conflict
export { 
  ModernTabs as ModernUITabs,
  ModernTabsList,
  ModernTabsTrigger,
  ModernTabsContent 
} from './modern-tabs';
export * from './modern-checkbox';
export * from './modern-switch';
export * from './modern-radio-group';
export * from './modern-tooltip';
export * from './modern-popover';
export * from './modern-dropdown-menu';
export * from './modern-table';
export * from './modern-pagination';
export * from './modern-alert-dialog';
export * from './modern-command';
export * from './modern-calendar';
export * from './modern-form';

// Explicitly export Skeleton components to avoid conflicts
export {
  Skeleton,
} from './skeleton';

export {
  Skeleton as ModernLoaderSkeleton,
  type SkeletonProps as ModernLoaderSkeletonProps
} from './modern-loader';

export * from './modern-skeleton';

// Export GlassButton component
export * from './glass-button';

// Re-export existing components for convenience
export * from './button';
export * from './card';
export * from './input';
export * from './form';
export * from './dialog';
export * from './sheet';
export * from './popover';
export * from './dropdown-menu';
export * from './tabs';
// export * from './badge';  // Removed to avoid conflict
export * from './avatar';
export * from './separator';
export * from './table';
export * from './textarea';
export * from './select';
export * from './checkbox';
export * from './radio-group';
export * from './switch';
export * from './slider';
export * from './progress';
export * from './scroll-area';
export * from './toast';
export * from './tooltip';
export * from './alert';
export * from './label';
export * from './menubar';
export * from './navigation-menu';
export * from './breadcrumb';
export * from './pagination';
export * from './calendar';
export * from './command';
export * from './context-menu';
export * from './hover-card';
export * from './accordion';
export * from './alert-dialog';
export * from './aspect-ratio';
export * from './collapsible';
export * from './drawer';
export * from './resizable';
// export * from './skeleton';  // Removed to avoid conflict
export * from './sonner';
export * from './toggle';
export * from './toggle-group';

// Export utility functions for global style usage
export { cn } from '@/lib/utils';
export type { ClassValue } from 'clsx';