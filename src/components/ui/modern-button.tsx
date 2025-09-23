import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { getGradient, getShadow } from '@/lib/design-tokens';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: `backdrop-blur-md bg-white/20 dark:bg-gray-800/50 border border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-300 ${getShadow('glass')}`,
        gradient: `bg-gradient-to-r ${getGradient('primary')} text-white hover:opacity-90`,
        neon: `relative overflow-hidden bg-gradient-to-r ${getGradient('primary')} text-white font-bold rounded-full px-6 py-2 ${getShadow('md')} hover:shadow-lg transition-all duration-300`,
      },
      size: {
        default: `h-10 px-4 py-2`,
        sm: `h-9 rounded-md px-3`,
        lg: `h-11 rounded-md px-8`,
        icon: `h-10 w-10`,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  fullWidth?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none'
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none'
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    fullWidth = false,
    rounded = 'md',
    shadow = 'md',
    hoverEffect = 'lift',
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const roundedStyles = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    }
    
    const shadowStyles = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
      none: 'shadow-none',
    }
    
    const hoverEffects = {
      lift: 'hover:-translate-y-0.5',
      scale: 'hover:scale-105',
      glow: 'hover:shadow-glow',
      none: '',
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          roundedStyles[rounded],
          shadowStyles[shadow],
          hoverEffects[hoverEffect],
          fullWidth && 'w-full',
          'transition-all duration-200 ease-in-out',
          className
        )}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
ModernButton.displayName = "ModernButton"

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  vertical?: boolean
  attached?: boolean
}

const ModernButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  vertical = false,
  attached = false,
}) => {
  return (
    <div 
      className={cn(
        'flex',
        vertical ? 'flex-col' : 'flex-row',
        attached ? 'space-x-0' : 'space-x-2',
        vertical && (attached ? 'space-y-0' : 'space-y-2'),
        className
      )}
    >
      {React.Children.map(children, (child, _index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: cn(
              attached && !vertical && 'rounded-none first:rounded-l-md last:rounded-r-md first:ml-0',
              attached && vertical && 'rounded-none first:rounded-t-md last:rounded-b-md first:mt-0',
              child.props.className
            ),
          });
        }
        return child;
      })}
    </div>
  )
}

// Button Icon Component
interface ButtonIconProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'ghost' | 'outline' | 'default' | 'glass'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  asChild?: boolean
}

const ModernButtonIcon = React.forwardRef<HTMLButtonElement, ButtonIconProps>(
  ({ className, variant = 'ghost', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const sizeClasses = {
      sm: 'h-8 w-8',
      default: 'h-10 w-10',
      lg: 'h-12 w-12',
    }
    
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      glass: 'backdrop-blur-md bg-white/20 dark:bg-gray-800/50 border border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/50',
    }
    
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-colors',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
ModernButtonIcon.displayName = "ModernButtonIcon"

export { ModernButton, ModernButtonGroup, ModernButtonIcon, buttonVariants }
