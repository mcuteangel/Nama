import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ModernCalendar, type ModernCalendarProps } from "@/components/ui/modern-calendar";

export type CalendarProps = ModernCalendarProps;

function Calendar(props: CalendarProps) {
  return <ModernCalendar {...props} />;
}
Calendar.displayName = "Calendar";

export { Calendar };
