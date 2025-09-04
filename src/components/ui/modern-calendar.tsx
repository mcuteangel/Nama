import * as React from "react";

import { cn } from "@/lib/utils";
import { JalaliCalendar } from "@/components/JalaliCalendar";
import type { JalaliCalendarProps } from "@/components/JalaliCalendar";

export type ModernCalendarProps = JalaliCalendarProps;

function ModernCalendar(props: ModernCalendarProps) {
  return <JalaliCalendar {...props} />;
}
ModernCalendar.displayName = "ModernCalendar";

export { ModernCalendar };