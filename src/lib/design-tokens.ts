/**
 * Design Tokens - Centralized design system based on ModernUIShowcase
 * این فایل شامل تمام توکن‌های طراحی برای حفظ consistency در کل اپلیکیشن است
 */

export const designTokens = {
  // ===== COLORS =====
  colors: {
    // Primary Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    // Secondary Colors
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    // Accent Colors
    accent: {
      50: '#fef7ff',
      100: '#fdf2ff',
      200: '#fce7ff',
      300: '#f3d5fa',
      400: '#e879f9',
      500: '#c026d3',
      600: '#a21caf',
      700: '#86198f',
      800: '#701a75',
      900: '#5b0f5b',
    },

    // Semantic Colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Extended Semantic Colors with variations
    semantic: {
      success: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
    },

    // Form-specific colors
    form: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropBlur: 'backdrop-blur-xl',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(31, 38, 135, 0.15)',
      hover: {
        background: 'rgba(255, 255, 255, 0.95)',
        shadow: 'rgba(31, 38, 135, 0.2)',
      },
      focus: {
        ring: 'rgba(59, 130, 246, 0.2)',
        shadow: 'rgba(31, 38, 135, 0.2)',
      },
    },

    // Neutral Colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // Glass Effect Colors
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(31, 38, 135, 0.15)',
    },

    // Dark Mode Colors
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      card: '#334155',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
    },
  },

  // ===== GRADIENTS =====
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    ocean: 'linear-gradient(135deg, #667eea 0%, #64b3f4 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    forest: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    pink: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  },

  // ===== TYPOGRAPHY =====
  typography: {
    fonts: {
      primary: "'Vazirmatn', 'Inter', sans-serif",
      secondary: "'Poppins', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },

    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },

    weights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },

    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // ===== SPACING =====
  spacing: {
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    18: '4.5rem',    // 72px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    44: '11rem',     // 176px
    48: '12rem',     // 192px
    52: '13rem',     // 208px
    56: '14rem',     // 224px
    60: '15rem',     // 240px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem',     // 384px
  },

  // ===== BORDER RADIUS =====
  borderRadius: {
    none: '0',
    xs: '0.0625rem',  // 1px
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '2.5xl': '1.25rem', // 20px
    '3xl': '1.5rem',   // 24px
    '3.5xl': '1.75rem', // 28px
    '4xl': '2rem',     // 32px
    '4.5xl': '2.25rem', // 36px
    '5xl': '2.5rem',   // 40px
    '6xl': '3rem',     // 48px
    '7xl': '3.5rem',   // 56px
    '8xl': '4rem',     // 64px
    full: '9999px',
  },
  // ===== TRANSITIONS =====
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // ===== SHADOWS =====
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.3)',

    // Glass shadows
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    glassMd: '0 12px 40px 0 rgba(31, 38, 135, 0.2)',
    glassStrong: '0 8px 32px 0 rgba(31, 38, 135, 0.4)',
    glassIntense: '0 16px 64px 0 rgba(31, 38, 135, 0.5)',

    // 3D Glass shadows
    glass3d: '0 20px 60px -12px rgba(0, 0, 0, 0.25), 0 8px 32px 0 rgba(31, 38, 135, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
    glass3dHover: '0 32px 80px -12px rgba(0, 0, 0, 0.35), 0 12px 40px 0 rgba(31, 38, 135, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
    glass3dActive: '0 16px 40px -8px rgba(0, 0, 0, 0.2), 0 4px 16px 0 rgba(31, 38, 135, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',

    // Colored shadows for form elements
    primary: '0 4px 12px 0 rgba(59, 130, 246, 0.15)',
    primaryHover: '0 8px 24px 0 rgba(59, 130, 246, 0.25)',
    secondary: '0 4px 12px 0 rgba(139, 92, 246, 0.15)',
    secondaryHover: '0 8px 24px 0 rgba(139, 92, 246, 0.25)',
    success: '0 4px 12px 0 rgba(16, 185, 129, 0.15)',
    successHover: '0 8px 24px 0 rgba(16, 185, 129, 0.25)',
    warning: '0 4px 12px 0 rgba(245, 158, 11, 0.15)',
    warningHover: '0 8px 24px 0 rgba(245, 158, 11, 0.25)',
    error: '0 4px 12px 0 rgba(239, 68, 68, 0.15)',
    errorHover: '0 8px 24px 0 rgba(239, 68, 68, 0.25)',

    // Inner shadows for inputs
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    innerFocus: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',

    // Neomorphism shadows
    neomorphism: '9px 9px 16px hsl(220, 13%, 18%), -9px -9px 16px hsl(220, 13%, 32%)',
    neomorphismInset: 'inset 6px 6px 12px hsl(220, 13%, 18%), inset -6px -6px 12px hsl(220, 13%, 32%)',
    neomorphismHover: '12px 12px 20px hsl(220, 13%, 18%), -12px -12px 20px hsl(220, 13%, 32%)',

    // Special effect shadows
    floating: '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)',
    floatingHover: '0 32px 64px -12px rgba(0, 0, 0, 0.2), 0 16px 32px -8px rgba(0, 0, 0, 0.15)',
    card: '0 4px 16px 0 rgba(0, 0, 0, 0.05), 0 2px 8px 0 rgba(0, 0, 0, 0.03)',
    cardHover: '0 8px 32px 0 rgba(0, 0, 0, 0.1), 0 4px 16px 0 rgba(0, 0, 0, 0.05)',
  },

  // ===== BREAKPOINTS =====
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ===== ANIMATIONS =====
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
      slowest: '1000ms',
    },

    easing: {
      linear: 'linear',
      in: 'ease-in',
      out: 'ease-out',
      inOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      glass: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },

    keyframes: {
      fadeInUp: {
        from: { opacity: 0, transform: 'translateY(30px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      fadeInDown: {
        from: { opacity: 0, transform: 'translateY(-30px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      scaleIn: {
        from: { opacity: 0, transform: 'scale(0.9)' },
        to: { opacity: 1, transform: 'scale(1)' },
      },
      slideIn: {
        from: { opacity: 0, transform: 'translateX(-30px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
      slideInRight: {
        from: { opacity: 0, transform: 'translateX(30px)' },
        to: { opacity: 1, transform: 'translateX(0)' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      pulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
      shimmer: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      glow: {
        '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
        '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
      },
      tilt: {
        '0%, 50%, 100%': { transform: 'rotate(0deg)' },
        '25%': { transform: 'rotate(1deg)' },
        '75%': { transform: 'rotate(-1deg)' },
      },
      bounceIn: {
        '0%': { opacity: 0, transform: 'scale(0.3)' },
        '50%': { opacity: 1, transform: 'scale(1.05)' },
        '70%': { transform: 'scale(0.9)' },
        '100%': { opacity: 1, transform: 'scale(1)' },
      },
      slideInUp: {
        from: { transform: 'translateY(100%)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
      slideInDown: {
        from: { transform: 'translateY(-100%)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
    },

    // Predefined animation classes
    classes: {
      fadeIn: 'animate-fadeInUp',
      scaleIn: 'animate-scaleIn',
      slideIn: 'animate-slideIn',
      slideInRight: 'animate-slideInRight',
      float: 'animate-float',
      pulse: 'animate-pulse',
      shimmer: 'animate-shimmer',
      glow: 'animate-glow',
      tilt: 'animate-tilt',
      bounceIn: 'animate-bounceIn',
      slideInUp: 'animate-slideInUp',
      slideInDown: 'animate-slideInDown',
    },
  },

  // ===== Z-INDEX =====
  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    modal: 1000,
    popover: 1300,
    tooltip: 1500,
    dropdown: 1000,
  },

  // ===== COMPONENT SPECIFIC TOKENS =====
  components: {
    button: {
      height: {
        sm: '2rem',    // 32px
        md: '2.5rem',  // 40px
        lg: '3rem',    // 48px
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.625rem 1.25rem',
        lg: '0.75rem 1.5rem',
      },
    },

    input: {
      height: '2.5rem', // 40px
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
    },

    card: {
      padding: '1.5rem',
      borderRadius: '1rem',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },

    modal: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '1.5rem',
      shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },

    // ===== NEW FORM COMPONENTS =====
    form: {
      // Floating Cards
      floatingCard: {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropBlur: 'backdrop-blur-xl',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '1rem',
        shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        hoverShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.5s ease-out',
      },

      // Field Containers
      fieldContainer: {
        padding: '1.5rem',
        marginBottom: '1rem',
        borderRadius: '1rem',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropBlur: 'backdrop-blur-xl',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        shadow: '0 4px 16px 0 rgba(31, 38, 135, 0.1)',
        hoverShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        transition: 'all 0.3s ease-out',
      },

      // Validation States
      validation: {
        success: {
          border: '2px solid #10b981',
          shadow: '0 0 0 4px rgba(16, 185, 129, 0.1)',
          background: 'rgba(16, 185, 129, 0.05)',
        },
        error: {
          border: '2px solid #ef4444',
          shadow: '0 0 0 4px rgba(239, 68, 68, 0.1)',
          background: 'rgba(239, 68, 68, 0.05)',
        },
        warning: {
          border: '2px solid #f59e0b',
          shadow: '0 0 0 4px rgba(245, 158, 11, 0.1)',
          background: 'rgba(245, 158, 11, 0.05)',
        },
        info: {
          border: '2px solid #3b82f6',
          shadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
          background: 'rgba(59, 130, 246, 0.05)',
        },
      },

      // Icon Containers
      iconContainer: {
        size: {
          sm: '2.5rem', // 40px
          md: '3rem',   // 48px
          lg: '3.5rem', // 56px
        },
        borderRadius: '0.75rem',
        shadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease-out',
      },

      // Focus States
      focus: {
        ring: '4px',
        ringColor: {
          primary: 'rgba(59, 130, 246, 0.2)',
          secondary: 'rgba(139, 92, 246, 0.2)',
          success: 'rgba(16, 185, 129, 0.2)',
          warning: 'rgba(245, 158, 11, 0.2)',
          error: 'rgba(239, 68, 68, 0.2)',
        },
        scale: '1.02',
        shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
      },

      // Hover States
      hover: {
        scale: '1.01',
        shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        background: 'rgba(255, 255, 255, 0.95)',
      },

      // Section Headers
      sectionHeader: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '1.5rem',
        shadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25)',
        iconSize: '3rem',
        titleSize: '2rem',
        descriptionSize: '1rem',
      },

      // Collapsible Sections
      collapsibleSection: {
        header: {
          padding: '1rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropBlur: 'backdrop-blur-md',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          shadow: '0 4px 12px 0 rgba(31, 38, 135, 0.1)',
        },
        content: {
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropBlur: 'backdrop-blur-md',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          marginTop: '0.5rem',
        },
      },

      // Action Buttons
      actionButton: {
        floating: {
          size: '4rem', // 64px
          shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.3)',
          hoverShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.4)',
          borderRadius: '1rem',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropBlur: 'backdrop-blur-xl',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        primary: {
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          shadow: '0 8px 32px 0 rgba(102, 126, 234, 0.3)',
          hoverShadow: '0 12px 40px 0 rgba(102, 126, 234, 0.4)',
          borderRadius: '1rem',
          transition: 'all 0.3s ease-out',
        },
      },
    },
  },
} as const;

// ===== UTILITY FUNCTIONS =====

/**
 * Get color value from design tokens
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: unknown = designTokens.colors;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }

  return typeof value === 'string' ? value : '';
}

/**
 * Get gradient value from design tokens
 */
export function getGradient(name: keyof typeof designTokens.gradients): string {
  return designTokens.gradients[name];
}

/**
 * Get spacing value from design tokens
 */
export function getSpacing(size: keyof typeof designTokens.spacing): string {
  return designTokens.spacing[size];
}

/**
 * Get typography value from design tokens
 */
export function getTypography(path: string): string | number {
  const keys = path.split('.');
  let value: unknown = designTokens.typography;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }

  return typeof value === 'string' || typeof value === 'number' ? value : '';
}

/**
 * Get shadow value from design tokens
 */
export function getShadow(name: keyof typeof designTokens.shadows): string {
  return designTokens.shadows[name];
}

/**
 * Get form component token value from design tokens
 */
export function getFormToken(path: string): string | number | undefined {
  const keys = path.split('.');
  let value: unknown = designTokens.components.form;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

/**
 * Get semantic color value from design tokens
 */
export function getSemanticColor(type: keyof typeof designTokens.colors.semantic, shade?: number): string {
  const semanticColors = designTokens.colors.semantic[type];
  if (typeof semanticColors === 'string') {
    return semanticColors;
  }
  if (shade && typeof semanticColors === 'object') {
    return (semanticColors as Record<number, string>)[shade] || semanticColors[500];
  }
  return semanticColors[500];
}

/**
 * Get form color value from design tokens
 */
export function getFormColor(path: string): string {
  const keys = path.split('.');
  let value: unknown = designTokens.colors.form;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }

  return typeof value === 'string' ? value : '';
}

/**
 * Get border radius value from design tokens
 */
export function getBorderRadius(name: keyof typeof designTokens.borderRadius): string {
  return designTokens.borderRadius[name];
}

/**
 * Get animation value from design tokens
 */
export function getAnimation(path: string): string {
  const keys = path.split('.');
  let value: unknown = designTokens.animations;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }

  return typeof value === 'string' ? value : '';
}

/**
 * Generate CSS custom properties from design tokens
 */
export function generateCSSCustomProperties(): string {
  const cssVars: string[] = [];

  // Colors
  Object.entries(designTokens.colors).forEach(([category, values]) => {
    if (typeof values === 'object' && values !== null) {
      Object.entries(values as Record<string, unknown>).forEach(([key, value]) => {
        if (typeof value === 'string') {
          cssVars.push(`  --color-${category}-${key}: ${value};`);
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value as Record<string, unknown>).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'string') {
              cssVars.push(`  --color-${category}-${key}-${subKey}: ${subValue};`);
            }
          });
        }
      });
    } else if (typeof values === 'string') {
      cssVars.push(`  --color-${category}: ${values};`);
    }
  });

  // Gradients
  Object.entries(designTokens.gradients).forEach(([key, value]) => {
    cssVars.push(`  --gradient-${key}: ${value};`);
  });

  // Spacing
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    cssVars.push(`  --spacing-${key}: ${value};`);
  });

  // Border radius
  Object.entries(designTokens.borderRadius).forEach(([key, value]) => {
    cssVars.push(`  --radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(designTokens.shadows).forEach(([key, value]) => {
    cssVars.push(`  --shadow-${key}: ${value};`);
  });

  // Form colors
  if (designTokens.colors.form) {
    Object.entries(designTokens.colors.form).forEach(([key, value]) => {
      if (typeof value === 'string') {
        cssVars.push(`  --form-color-${key}: ${value};`);
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value as Record<string, unknown>).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'string') {
            cssVars.push(`  --form-color-${key}-${subKey}: ${subValue};`);
          }
        });
      }
    });
  }

  // Form component tokens
  if (designTokens.components.form) {
    const addFormTokens = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}-${key}` : key;
        if (typeof value === 'string' || typeof value === 'number') {
          cssVars.push(`  --form-${fullKey}: ${value};`);
        } else if (typeof value === 'object' && value !== null) {
          addFormTokens(value, fullKey);
        }
      });
    };
    addFormTokens(designTokens.components.form);
  }

  return `:root {\n${cssVars.join('\n')}\n}`;
}

// ===== TYPE DEFINITIONS =====
export type ColorKeys = keyof typeof designTokens.colors;
export type GradientKeys = keyof typeof designTokens.gradients;
export type SpacingKeys = keyof typeof designTokens.spacing;
export type ShadowKeys = keyof typeof designTokens.shadows;
export type AnimationKeys = keyof typeof designTokens.animations;
export type BreakpointKeys = keyof typeof designTokens.breakpoints;
export type ZIndexKeys = keyof typeof designTokens.zIndex;
export type SemanticColorKeys = keyof typeof designTokens.colors.semantic;
export type FormTokenKeys = keyof typeof designTokens.components.form;
export type BorderRadiusKeys = keyof typeof designTokens.borderRadius;
export type TypographyKeys = keyof typeof designTokens.typography;