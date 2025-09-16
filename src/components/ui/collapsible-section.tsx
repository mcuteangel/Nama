import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const CollapsibleSection = React.forwardRef<
  HTMLDivElement,
  CollapsibleSectionProps
>(({ title, children, defaultOpen = false, className, icon }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div 
      ref={ref} 
      className={cn(
        "rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm transition-all duration-300",
        "hover:shadow-md hover:shadow-primary-500/10 dark:hover:shadow-primary-900/20",
        className
      )}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between p-4 text-left font-medium transition-colors duration-200",
          "bg-gradient-to-br from-white/50 to-white/30 dark:from-neutral-800/50 dark:to-neutral-900/30",
          "border-b border-border/50 hover:bg-white/60 dark:hover:bg-neutral-800/60",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-t-2xl"
        )}
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={`${title.replace(/\s+/g, '-').toLowerCase()}-content`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100/80 dark:bg-primary-900/30">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <div className="transition-transform duration-300 ease-in-out">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-foreground" />
          )}
        </div>
      </button>
      
      <div
        id={`${title.replace(/\s+/g, '-').toLowerCase()}-content`}
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
});

CollapsibleSection.displayName = "CollapsibleSection";

export { CollapsibleSection };