import * as React from "react";
import { cn } from "@/lib/utils";
import { JalaliCalendar } from "@/components/JalaliCalendar";
import type { JalaliCalendarProps } from "@/components/JalaliCalendar";

export type CalendarProps = JalaliCalendarProps;

function Calendar(props: CalendarProps) {
  return <JalaliCalendar {...props} />;
}
Calendar.displayName = "Calendar";

export { Calendar };