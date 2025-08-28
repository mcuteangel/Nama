import { cn } from "@/lib/utils";
import { ModernSkeleton, type ModernSkeletonProps } from "@/components/ui/modern-skeleton";

function Skeleton({ className, ...props }: ModernSkeletonProps) {
  return (
    <ModernSkeleton
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };