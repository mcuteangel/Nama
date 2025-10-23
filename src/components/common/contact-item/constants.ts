import { designTokens } from '@/lib/design-tokens';

export const contactItemConstants = {
  cardStyles: {
    base: 'group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl',
    selected: 'ring-2 ring-blue-500 bg-blue-50/50',
    background: {
      selected: 'rgba(59, 130, 246, 0.1)',
      unselected: 'rgba(255, 255, 255, 0.7)'
    },
    border: {
      selected: designTokens.colors.primary[400],
      unselected: 'rgba(0, 0, 0, 0.05)'
    },
    backdropFilter: 'blur(12px)',
    boxShadow: {
      selected: '0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 8px 10px -6px rgba(59, 130, 246, 0.2)',
      unselected: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
    },
    padding: designTokens.spacing[4],
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: {
      disabled: 'none',
      normal: 'auto'
    }
  },
  gradientOverlay: {
    className: 'absolute inset-0 opacity-0 group-hover:opacity-5 transition-all duration-500 ease-out',
    style: {
      background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
      borderRadius: '1.5rem',
      transform: 'scale(0.95) translateZ(0)',
      transition: 'opacity 0.3s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }
  },
  borderOverlay: {
    className: 'absolute inset-0 border-2 border-transparent group-hover:border-blue-100 transition-all duration-300 rounded-3xl pointer-events-none',
    style: {
      boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.1)'
    }
  },
  layout: {
    container: 'relative z-10 flex items-center justify-between',
    content: 'flex items-center gap-6 flex-grow min-w-0',
    info: 'min-w-0 flex-grow transition-all duration-300 group-hover:translate-x-1'
  },
  typography: {
    name: 'font-semibold text-base mb-1.5 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300',
    style: {
      fontFamily: designTokens.typography.fonts.primary,
      color: designTokens.colors.gray[800],
      marginBottom: designTokens.spacing[1]
    }
  },
  animations: {
    willChange: 'transform, box-shadow, border-color'
  }
} as const;
