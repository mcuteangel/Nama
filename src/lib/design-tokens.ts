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
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      900: '#0c4a6e',
    },

    // Semantic Colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

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
    success: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    warning: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    danger: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    info: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
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
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // ===== BORDER RADIUS =====
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // ===== SHADOWS =====
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Glass shadows
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    glassStrong: '0 8px 32px 0 rgba(31, 38, 135, 0.4)',

    // 3D Glass shadows
    glass3d: '0 20px 60px -12px rgba(0, 0, 0, 0.25), 0 8px 32px 0 rgba(31, 38, 135, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
    glass3dHover: '0 32px 80px -12px rgba(0, 0, 0, 0.35), 0 12px 40px 0 rgba(31, 38, 135, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',

    // Neomorphism shadows
    neomorphism: '9px 9px 16px hsl(220, 13%, 18%), -9px -9px 16px hsl(220, 13%, 32%)',
    neomorphismInset: 'inset 6px 6px 12px hsl(220, 13%, 18%), inset -6px -6px 12px hsl(220, 13%, 32%)',
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
    },

    easing: {
      linear: 'linear',
      in: 'ease-in',
      out: 'ease-out',
      inOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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