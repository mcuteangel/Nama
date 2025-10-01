import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { ModernInput } from '@/components/ui/modern-input';
import { JalaliCalendar } from '@/components/JalaliCalendar';
import {
  ModernPopover,
  ModernPopoverContent,
  ModernPopoverTrigger,
} from '@/components/ui/modern-popover';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useJalaliCalendar } from '@/hooks/use-jalali-calendar';

export interface ModernDatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "glass" | "neomorphism" | "gradient";
  inputSize?: "sm" | "md" | "lg";
}

export const ModernDatePicker = React.forwardRef<
  HTMLDivElement,
  ModernDatePickerProps
>(({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  variant = "default",
  inputSize = "md",
  ...props
}, ref) => {
  const { t } = useTranslation();
  const { formatDate } = useJalaliCalendar();
  const [isOpen, setIsOpen] = useState(false);

  // Format date for display based on calendar type
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    try {
      // Handle both ISO string and Date object
      const date = typeof value === 'string' ? new Date(value + 'T00:00:00.000Z') : value;
      return formatDate(date);
    } catch (error) {
      console.warn('Date parsing error:', error, 'Value:', value);
      return value;
    }
  }, [value, formatDate]);

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    if (onChange) {
      // Create date with local time components to avoid timezone issues
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      // Create new date object with same local date but at midnight UTC
      const selectedDate = new Date(Date.UTC(year, month, day));

      // Send date in ISO format for backend storage (YYYY-MM-DD)
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('Selected date:', dateStr, 'Original date:', date);
      onChange(dateStr);
    }
    setIsOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <ModernPopover open={isOpen} onOpenChange={setIsOpen}>
        <ModernPopoverTrigger asChild>
          <div className="relative">
            <ModernInput
              value={displayValue}
              placeholder={placeholder || t('form_placeholders.select_birth_date')}
              variant={variant}
              inputSize={inputSize}
              className={cn(
                "pl-4 pr-12 py-3 w-full",
                className
              )}
              disabled={disabled}
              readOnly
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Calendar size={16} className="text-gray-400" />
            </div>
          </div>
        </ModernPopoverTrigger>
        <ModernPopoverContent
          className="p-0 w-auto"
          align="start"
          glassEffect="advanced"
        >
          <JalaliCalendar
            selected={value ? new Date(value) : undefined}
            onSelect={handleDateSelect}
            variant="glass"
          />
        </ModernPopoverContent>
      </ModernPopover>
    </div>
  );
});

ModernDatePicker.displayName = "ModernDatePicker";