import React, { createContext } from 'react';

// Types
export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  announceChanges: boolean;
}

export interface FocusManager {
  trapFocus: boolean;
  restoreFocus: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

export interface AccessibilityContextType {
  // Settings
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  
  // ARIA Labels and Descriptions
  ariaLabels: Map<string, string>;
  setAriaLabel: (key: string, label: string) => void;
  getAriaLabel: (key: string, fallback?: string) => string;
  
  // Live Region Announcements
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  
  // Focus Management
  focusManager: FocusManager;
  setFocusManager: (manager: Partial<FocusManager>) => void;
  focusElement: (element: HTMLElement | null) => void;
  
  // Keyboard Navigation
  keyboardShortcuts: Map<string, () => void>;
  registerShortcut: (key: string, callback: () => void) => void;
  unregisterShortcut: (key: string) => void;
  
  // Skip Links
  skipLinks: { label: string; target: string }[];
  addSkipLink: (label: string, target: string) => void;
  removeSkipLink: (target: string) => void;
}

export const defaultSettings: AccessibilitySettings = {
  reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  highContrast: window.matchMedia('(prefers-contrast: high)').matches,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  announceChanges: true,
};

export const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export default AccessibilityContext;