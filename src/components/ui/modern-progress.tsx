import React from 'react';
import { cn } from '@/lib/utils';

export interface ModernProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
}

/**
 * ModernProgress - کامپوننت نمایش پیشرفت مدرن
 * @param value - مقدار فعلی (0 تا max)
 * @param max - حداکثر مقدار
 * @param variant - نوع ظاهری
 * @param size - اندازه
 * @param showValue - نمایش درصد
 * @param animated - انیمیشن حرکتی
 * @param striped - الگوی راه‌راه
 * @param indeterminate - حالت نامعین
 */
export function ModernProgress({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  showValue = false,
  animated = false,
  striped = false,
  indeterminate = false,
  className,
  ...props
}: ModernProgressProps) {
  const percentage = indeterminate ? 100 : Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variants = {
    default: 'bg-primary',
    success: 'bg-gradient-success',
    warning: 'bg-gradient-warning',
    error: 'bg-gradient-danger',
    gradient: 'bg-gradient-primary'
  };

  return (
    <div className={cn('relative w-full', className)} {...props}>
      {/* نمایش درصد */}
      {showValue && !indeterminate && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div 
        className={cn(
          'w-full bg-secondary rounded-full overflow-hidden',
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={indeterminate ? 'در حال بارگذاری' : `پیشرفت: ${Math.round(percentage)}%`}
      >
        {/* Progress Fill */}
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            variants[variant],
            striped && 'bg-striped',
            animated && 'animate-pulse',
            indeterminate && 'animate-indeterminate'
          )}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
            transform: indeterminate ? 'translateX(-100%)' : undefined,
            animation: indeterminate ? 'indeterminateProgress 2s ease-in-out infinite' : undefined
          }}
        />
      </div>
    </div>
  );
}

export interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  showValue?: boolean;
  indeterminate?: boolean;
  className?: string;
}

/**
 * CircularProgress - نوار پیشرفت دایره‌ای
 */
export function CircularProgress({
  value = 0,
  max = 100,
  size = 64,
  strokeWidth = 6,
  variant = 'default',
  showValue = false,
  indeterminate = false,
  className
}: CircularProgressProps) {
  const percentage = indeterminate ? 75 : Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference.toFixed(3);
  const strokeDashoffset = indeterminate 
    ? circumference * 0.25 
    : (circumference - (percentage / 100) * circumference).toFixed(3);

  const colors = {
    default: '#3b82f6', // blue-500
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    gradient: 'url(#gradient)'
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        className={cn(
          'transform -rotate-90',
          indeterminate && 'animate-spin'
        )}
        width={size}
        height={size}
      >
        {/* Gradient Definition */}
        {variant === 'gradient' && (
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
        )}
        
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted-foreground/20"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            animation: indeterminate ? 'circularProgress 1.5s ease-in-out infinite' : undefined
          }}
        />
      </svg>
      
      {/* Value Display */}
      {showValue && !indeterminate && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

export interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
  variant?: 'default' | 'success' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * ProgressSteps - نمایش پیشرفت به صورت مراحل
 */
export function ProgressSteps({
  steps,
  currentStep,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  className
}: ProgressStepsProps) {
  const sizes = {
    sm: { circle: 'w-6 h-6 text-xs', line: 'h-0.5', text: 'text-xs' },
    md: { circle: 'w-8 h-8 text-sm', line: 'h-1', text: 'text-sm' },
    lg: { circle: 'w-10 h-10 text-base', line: 'h-1.5', text: 'text-base' }
  };

  const variants = {
    default: {
      active: 'bg-primary text-primary-foreground',
      completed: 'bg-primary text-primary-foreground',
      pending: 'bg-muted text-muted-foreground',
      line: 'bg-primary'
    },
    success: {
      active: 'bg-green-500 text-white',
      completed: 'bg-green-500 text-white',
      pending: 'bg-muted text-muted-foreground',
      line: 'bg-green-500'
    },
    gradient: {
      active: 'bg-gradient-primary text-white',
      completed: 'bg-gradient-primary text-white',
      pending: 'bg-muted text-muted-foreground',
      line: 'bg-gradient-primary'
    }
  };

  const { circle, line, text } = sizes[size];
  const colors = variants[variant];

  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn(
      'flex',
      isHorizontal ? 'items-center space-x-4' : 'flex-col space-y-4',
      className
    )}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isPending = index > currentStep;

        const circleStyle = isCompleted 
          ? colors.completed 
          : isActive 
            ? colors.active 
            : colors.pending;

        return (
          <div
            key={index}
            className={cn(
              'flex items-center',
              !isHorizontal && 'flex-col text-center',
              isHorizontal && index < steps.length - 1 && 'flex-1'
            )}
          >
            {/* Step Circle */}
            <div className={cn(
              'flex items-center justify-center rounded-full font-medium transition-all duration-300',
              circle,
              circleStyle,
              'hover:scale-110'
            )}>
              {index + 1}
            </div>
            
            {/* Step Label */}
            <span className={cn(
              'font-medium transition-colors duration-300',
              text,
              isActive ? 'text-foreground' : 'text-muted-foreground',
              isHorizontal ? 'ml-2' : 'mt-2'
            )}>
              {step}
            </span>
            
            {/* Connector Line */}
            {index < steps.length - 1 && isHorizontal && (
              <div className={cn(
                'flex-1 mx-4 rounded transition-colors duration-300',
                line,
                isCompleted ? colors.line : 'bg-muted'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}