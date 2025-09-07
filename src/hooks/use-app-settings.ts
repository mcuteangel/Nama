import { useState, useEffect } from 'react';

export interface AppSettings {
  contactDisplayMode: 'grid' | 'list';
  theme: 'light' | 'dark' | 'system';
  language: 'fa' | 'en';
  calendarType: 'jalali' | 'gregorian';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  contactUpdates?: boolean;
  aiSuggestions?: boolean;
  systemAlerts?: boolean;
  marketing?: boolean;
  dailySummaryTime?: string;
  profileVisibility?: 'public' | 'private' | 'contacts';
  twoFactorAuth?: boolean;
}

const defaultSettings: AppSettings = {
  contactDisplayMode: 'grid',
  theme: 'system',
  language: 'fa',
  calendarType: 'jalali',
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  contactUpdates: true,
  aiSuggestions: true,
  systemAlerts: true,
  marketing: false,
  dailySummaryTime: '09:00',
  profileVisibility: 'public',
  twoFactorAuth: false,
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.warn('Failed to load app settings:', error);
        setError('Failed to load settings');
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    try {
      localStorage.setItem('appSettings', JSON.stringify(updated));

      // Dispatch custom events for specific setting changes
      Object.keys(newSettings).forEach(key => {
        window.dispatchEvent(new CustomEvent(`${key}Changed`, {
          detail: { value: newSettings[key as keyof AppSettings] }
        }));
      });
    } catch (error) {
      console.error('Failed to save app settings:', error);
      setError('Failed to save settings');
    }
  };

  // Get a specific setting
  const getSetting = <K extends keyof AppSettings>(key: K): AppSettings[K] => {
    return settings[key];
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('appSettings');
      window.dispatchEvent(new CustomEvent('settingsReset'));
    } catch (error) {
      console.error('Failed to reset app settings:', error);
      setError('Failed to reset settings');
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    settings,
    isLoaded,
    error,
    updateSettings,
    getSetting,
    resetSettings,
    clearError,
  };
};

export default useAppSettings;