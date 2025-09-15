import tailwindcssAnimate from "tailwindcss-animate";
import { designTokens } from "./src/styles/design-tokens";
import type { Config } from "tailwindcss";

// Extract only the required tokens
const { colors, typography, spacing, borderRadius, shadows } = designTokens;

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: spacing[4],
      screens: {
        sm: designTokens.breakpoints.sm,
        md: designTokens.breakpoints.md,
        lg: designTokens.breakpoints.lg,
        xl: designTokens.breakpoints.xl,
        '2xl': designTokens.breakpoints['2xl'],
      },
    },
    extend: {
      colors: {
        // رنگ‌های اصلی
        primary: {
          DEFAULT: 'var(--color-primary, #0ea5e9)',
          hover: 'var(--color-primary-hover, #0284c7)',
          active: 'var(--color-primary-active, #0369a1)',
          light: 'var(--color-primary-light, #bae6fd)',
          lightHover: 'var(--color-primary-light-hover, #7dd3fc)',
          ...colors.primary
        },
        // پس‌زمینه‌ها
        background: 'var(--color-background, #ffffff)',
        surface: {
          DEFAULT: 'var(--color-surface, #f8fafc)',
          hover: 'var(--color-surface-hover, #f1f5f9)',
          active: 'var(--color-surface-active, #e2e8f0)'
        },
        // متون
        text: {
          DEFAULT: 'hsl(var(--foreground))',
          primary: 'var(--color-text-primary, #0f172a)',
          secondary: 'var(--color-text-secondary, #475569)',
          tertiary: 'var(--color-text-tertiary, #94a3b8)',
          inverted: 'var(--color-text-inverted, #ffffff)',
          foreground: 'hsl(var(--foreground))'
        },
        // حاشیه‌ها
        border: 'var(--color-border, #e2e8f0)',
        borderHover: 'var(--color-border-hover, #cbd5e1)',
        // وضعیت‌ها
        success: {
          DEFAULT: 'var(--color-success, #22c55e)',
          ...colors.success
        },
        warning: {
          DEFAULT: 'var(--color-warning, #f59e0b)',
          ...colors.warning
        },
        error: {
          DEFAULT: 'var(--color-error, #ef4444)',
          ...colors.error
        },
        info: {
          DEFAULT: 'var(--color-info, #0ea5e9)',
          ...colors.primary
        },
        // شیشه‌ای
        glass: 'var(--glass, rgba(255, 255, 255, 0.1))',
        glassBorder: 'var(--glass-border, rgba(255, 255, 255, 0.2))',
        // گرادیانت‌ها
        gradient: {
          primary: 'var(--gradient-primary, linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%))',
          surface: 'var(--gradient-surface, linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%))'
        }
      },
      // تایپوگرافی
      fontFamily: {
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono,
        'display': ['Poppins', 'sans-serif'],
        'persian': ['Vazirmatn', 'sans-serif'],
        'english': ['Inter', 'sans-serif'],
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      // شعاع گوشه‌ها
      borderRadius: {
        ...borderRadius,
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // سایه‌ها
      boxShadow: (() => {
        // ادغام سایه‌های سفارشی با مقادیر پیش‌فرض
        const defaultShadows = {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
          none: '0 0 #0000'
        };

        // اضافه کردن سایه‌های سفارشی که در پیش‌فرض‌ها وجود ندارند
        const customShadows = Object.entries(shadows || {})
          .filter(([key]) => !(key in defaultShadows))
          .reduce((acc, [key, value]) => ({
            ...acc,
            [key]: value
          }), {});

        return {
          ...defaultShadows,
          ...customShadows
        };
      })(),
      keyframes: {
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' }
        },
        'slide-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' }
        },
        'slide-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' }
        },
        'slide-left': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' }
        },
        'slide-right': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' }
        },
        'spin': {
          to: { transform: 'rotate(360deg)' }
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' }
        },
        'bounce': {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8,0,1,1)'
          },
          '50%': {
            transform: 'none',
            animationTimingFunction: 'cubic-bezier(0,0,0.2,1)'
          }
        },
        'fadeInUp': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fadeInDown': {
          from: {
            opacity: "0",
            transform: "translateY(-30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fadeInLeft": {
          from: {
            opacity: "0",
            transform: "translateX(-30px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fadeInRight": {
          from: {
            opacity: "0",
            transform: "translateX(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "scaleIn": {
          from: {
            opacity: "0",
            transform: "scale(0.9)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      // انیمیشن‌های سفارشی
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out forwards",
        "accordion-up": "accordion-up 0.2s ease-in forwards",
        "tabShow": "tabShow 0.3s ease-out forwards",
        "tabHide": "tabHide 0.2s ease-in forwards",
        "collapsible-down": "collapsible-down 0.3s ease-out forwards",
        "collapsible-up": "collapsible-up 0.2s ease-in forwards",
        "floating": "floating 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "fade-in-left": "fadeInLeft 0.6s ease-out",
        "fade-in-right": "fadeInRight 0.6s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
    },
  },
  // پلاگین‌ها
  plugins: [
    tailwindcssAnimate,
    // پلاگین‌های سفارشی می‌توانند اینجا اضافه شوند
  ],
} satisfies Config;