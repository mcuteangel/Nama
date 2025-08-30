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
        glass: 'glass-advanced text-foreground border border-white/20 hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-md',
        neomorphism: 'neomorphism text-foreground hover:shadow-lg',
        'gradient-primary': 'bg-gradient-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-ocean': 'bg-gradient-ocean text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-sunset': 'bg-gradient-sunset text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-success': 'bg-gradient-success text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-warning': 'bg-gradient-warning text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-danger': 'bg-gradient-danger text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-info': 'bg-gradient-info text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        'gradient-forest': 'bg-gradient-forest text-white hover:opacity-90 shadow-lg hover:shadow-xl',
        // Glass gradient variants
        'glass-gradient-primary': 'glass-advanced bg-gradient-primary text-white hover:opacity-90 border border-white/20 backdrop-blur-md',
        'glass-gradient-ocean': 'glass-advanced bg-gradient-ocean text-white hover:opacity-90 border border-white/20 backdrop-blur-md',
        'glass-gradient-sunset': 'glass-advanced bg-gradient-sunset text-white hover:opacity-90 border border-white/20 backdrop-blur-md',
        'glass-gradient-success': 'glass-advanced bg-gradient-success text-white hover:opacity-90 border border-white/20 backdrop-blur-md',
        'glass-gradient-warning': 'glass-advanced bg-gradient-warning text-white hover:opacity-90 border border-white/20 backdrop-blur-md',
        'glass-gradient-danger': 'glass-advanced bg-gradient-danger text-white hover:opacity-90 border border-white/20 backdrop-blur-md',
        'glass-gradient-info': 'glass-advanced bg-gradient-info text-white hover:opacity-90 border border-white/20 backdrop-blur-md',
        'glass-gradient-forest': 'glass-advanced bg-gradient-forest text-white hover:opacity-90 border border-white/20 backdrop-blur-md',
        // 3D/neumorphism gradient variants
        '3d-gradient-primary': 'bg-gradient-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl neomorphism',
        '3d-gradient-ocean': 'bg-gradient-ocean text-white hover:opacity-90 shadow-lg hover:shadow-xl neomorphism',
        '3d-gradient-sunset': 'bg-gradient-sunset text-white hover:opacity-90 shadow-lg hover:shadow-xl neomorphism',
        '3d-gradient-success': 'bg-gradient-success text-white hover:opacity-90 shadow-lg hover:shadow-xl neomorphism',
        '3d-gradient-warning': 'bg-gradient-warning text-white hover:opacity-90 shadow-lg hover:shadow-xl neomorphism',
        '3d-gradient-danger': 'bg-gradient-danger text-white hover:opacity-90 shadow-lg hover:shadow-xl neomorphism',
        '3d-gradient-info': 'bg-gradient-info text-white hover:opacity-90 shadow-lg hover:shadow-xl neomorphism',
        '3d-gradient-forest': 'bg-gradient-forest text-white hover:opacity-90 shadow-lg hover:shadow-xl neomorphism',
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