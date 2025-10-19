import i18n from 'i18next';

// Constants for application texts that use i18n for translations
export const APP_TEXTS = {
  get APP_NAME() {
    return i18n.t('app.name');
  },
  FONTS: {
    get FALLBACK() {
      return i18n.t('app.fonts.fallback');
    },
  },
  COLORS: {
    SHADOW: 'rgba(0, 0, 0, 0.3)',
    WHITE: '#ffffff',
    PRIMARY: '#1890ff',
    PRIMARY_DARK: '#0960a5',
  },
  STYLES: {
    FAVICON_SIZE: 32,
    FONT_WEIGHT_BOLD: 'bold',
  },
  // Add other text constants here
} as const;
