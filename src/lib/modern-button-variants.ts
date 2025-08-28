import { cva } from 'class-variance-authority';

export const modernButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        glass: 'glass-advanced text-foreground hover:bg-opacity-80',
        neomorphism: 'neomorphism text-foreground hover:shadow-lg',
        'gradient-primary': 'bg-gradient-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-ocean': 'bg-gradient-ocean text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-sunset': 'bg-gradient-sunset text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-success': 'bg-gradient-success text-white hover:opacity-90 shadow-lg hover:shadow-xl',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
      effect: {
        none: '',
        ripple: 'ripple',
        lift: 'hover-lift',
        glow: 'hover-glow',
        scale: 'hover:scale-105',
        pulse: 'pulse-glow',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      effect: 'lift',
    },
  }
);