import React, { useState, useRef, useEffect } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  // Format date for display
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    // Format as YYYY-MM-DD for consistency
    return date.toISOString().split('T')[0];
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setTempDate(date);
    if (onChange) {
      onChange(date.toISOString().split('T')[0]);
    }
    setIsOpen(false);
  };

  // Handle input clear
  const handleClear = () => {
    setTempDate(undefined);
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <ModernPopover open={isOpen} onOpenChange={setIsOpen}>
        <ModernPopoverTrigger asChild>
          <div className="relative">
            <ModernInput
              value={value || ''}
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