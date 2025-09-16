import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FormSectionSkeletonProps {
  title?: boolean;
  description?: boolean;
  fields?: number;
  className?: string;
}

export function FormSectionSkeleton({
  title = true,
  description = true,
  fields = 3,
  className,
}: FormSectionSkeletonProps) {
  return (
    <div className={cn("space-y-6 p-6 bg-card rounded-lg border border-border/50 shadow-sm", className)}>
      <div className="space-y-2">
        {title && <Skeleton className="h-6 w-48" />}
        {description && <Skeleton className="h-4 w-64" />}
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}
