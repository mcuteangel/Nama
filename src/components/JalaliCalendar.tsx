import * as React from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale/fa-IR"; // Import the Persian locale
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Ensure these are imported

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  variant?: 'default' | 'glass';
  showToggle?: boolean; // Added for toggling calendar type
};

function JalaliCalendar({
  className,
  classNames,
  showOutsideDays = true,
  variant = 'default',
  showToggle = true, // Default to true
  ...props
}: CalendarProps) {
  // This state and logic is for toggling between calendar types (Gregorian/Jalali)
  // Assuming it's already implemented or not relevant to this specific fix.
  // For this fix, we are ensuring the Jalali calendar itself is correct.

  return (
    <div
      className={cn(
        "p-4 rounded-lg w-full max-w-xs shadow-lg",
        variant === 'glass' && "glass bg-opacity-80 backdrop-blur-sm border border-opacity-10",
        className
      )}
    >
      {showToggle && (
        // Placeholder for calendar type toggle if it exists
        // <Button onClick={toggleCalendarType}>Toggle Calendar</Button>
        null
      )}
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="p-3"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute right-1",
          nav_button_next: "absolute left-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-l-md [&:has([aria-selected].day-range-start)]:rounded-r-md [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-r-md last:[&:has([aria-selected])]:rounded-l-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_start: "day-range-start",
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        }}
        // Set the locale to faIR and weekStartsOn to 6 (Saturday)
        locale={faIR}
        weekStartsOn={6}
        {...props}
      />
    </div>
  );
}

JalaliCalendar.displayName = "JalaliCalendar";

export { JalaliCalendar };