import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { announce } from '@react-aria/live-announcer';
import { FocusTrap } from 'focus-trap-react';
import { useTranslation } from 'react-i18next';

// Types
interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  announceChanges: boolean;
}

interface FocusManager {
  trapFocus: boolean;
  restoreFocus: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

interface AccessibilityContextType {
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

const defaultSettings: AccessibilitySettings = {
  reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  highContrast: window.matchMedia('(prefers-contrast: high)').matches,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  announceChanges: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Custom hook for screen reader detection
const useScreenReaderDetection = () => {
  const [isScreenReader, setIsScreenReader] = useState(false);
  
  useEffect(() => {
    // Check for screen reader indicators
    const hasScreenReader = 
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.speechSynthesis !== undefined ||
      'speechSynthesis' in window;
    
    setIsScreenReader(hasScreenReader);
  }, []);
  
  return isScreenReader;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
  initialSettings?: Partial<AccessibilitySettings>;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  initialSettings = {},
}) => {
  const { t } = useTranslation();
  const isScreenReader = useScreenReaderDetection();
  
  // State
  const [settings, setSettings] = useState<AccessibilitySettings>({
    ...defaultSettings,
    ...initialSettings,
    screenReaderOptimized: isScreenReader,
  });
  
  const [ariaLabels] = useState<Map<string, string>>(new Map());
  const [keyboardShortcuts] = useState<Map<string, () => void>>(new Map());
  const [skipLinks, setSkipLinks] = useState<{ label: string; target: string }[]>([]);
  const [focusManager, setFocusManagerState] = useState<FocusManager>({
    trapFocus: false,
    restoreFocus: true,
  });
  
  // Refs
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  // ARIA Labels Management
  const setAriaLabel = useCallback((key: string, label: string) => {
    ariaLabels.set(key, label);
  }, [ariaLabels]);
  
  const getAriaLabel = useCallback((key: string, fallback?: string) => {
    return ariaLabels.get(key) || fallback || key;
  }, [ariaLabels]);
  
  // Live Region Announcements
  const announceMessage = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (settings.announceChanges) {
      announce(message, priority);
    }
  }, [settings.announceChanges]);
  
  // Focus Management
  const setFocusManager = useCallback((manager: Partial<FocusManager>) => {
    setFocusManagerState(prev => ({ ...prev, ...manager }));
  }, []);
  
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element && settings.keyboardNavigation) {
      // Store current focus for restoration
      lastFocusedElement.current = document.activeElement as HTMLElement;
      
      // Focus the element
      element.focus();
      
      // Announce focus change for screen readers
      if (settings.screenReaderOptimized) {
        const elementLabel = element.getAttribute('aria-label') || 
                           element.getAttribute('title') || 
                           element.textContent || 
                           'Element';
        announceMessage(`${t('accessibility.focused', 'Focused')}: ${elementLabel}`);
      }
    }
  }, [settings.keyboardNavigation, settings.screenReaderOptimized, announceMessage, t]);
  
  // Keyboard Shortcuts Management
  const registerShortcut = useCallback((key: string, callback: () => void) => {
    keyboardShortcuts.set(key, callback);
  }, [keyboardShortcuts]);
  
  const unregisterShortcut = useCallback((key: string) => {
    keyboardShortcuts.delete(key);
  }, [keyboardShortcuts]);
  
  // Skip Links Management
  const addSkipLink = useCallback((label: string, target: string) => {
    setSkipLinks(prev => {
      const exists = prev.some(link => link.target === target);
      if (!exists) {
        return [...prev, { label, target }];
      }
      return prev;
    });
  }, []);
  
  const removeSkipLink = useCallback((target: string) => {
    setSkipLinks(prev => prev.filter(link => link.target !== target));
  }, []);
  
  // Keyboard Event Handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!settings.keyboardNavigation) return;
      
      const key = event.key.toLowerCase();
      const modifiers = [];
      
      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.altKey) modifiers.push('alt');
      if (event.shiftKey) modifiers.push('shift');
      if (event.metaKey) modifiers.push('meta');
      
      const shortcutKey = [...modifiers, key].join('+');
      const callback = keyboardShortcuts.get(shortcutKey);
      
      if (callback) {
        event.preventDefault();
        callback();
      }
      
      // Handle escape key for focus restoration
      if (key === 'escape' && focusManager.restoreFocus && lastFocusedElement.current) {
        lastFocusedElement.current.focus();
        lastFocusedElement.current = null;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation, keyboardShortcuts, focusManager.restoreFocus]);
  
  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Reduce motion
    if (settings.reduceMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Screen reader optimization
    if (settings.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  }, [settings]);
  
  // Default ARIA labels setup
  useEffect(() => {
    setAriaLabel('navigation', t('accessibility.navigation', 'Navigation'));
    setAriaLabel('main-content', t('accessibility.main_content', 'Main content'));
    setAriaLabel('search', t('accessibility.search', 'Search'));
    setAriaLabel('menu', t('accessibility.menu', 'Menu'));
    setAriaLabel('close', t('accessibility.close', 'Close'));
    setAriaLabel('back', t('accessibility.back', 'Back'));
    setAriaLabel('next', t('accessibility.next', 'Next'));
    setAriaLabel('previous', t('accessibility.previous', 'Previous'));
    setAriaLabel('loading', t('accessibility.loading', 'Loading'));
    setAriaLabel('error', t('accessibility.error', 'Error'));
    setAriaLabel('success', t('accessibility.success', 'Success'));
  }, [t, setAriaLabel]);
  
  // Default skip links
  useEffect(() => {
    addSkipLink(t('accessibility.skip_to_content', 'Skip to main content'), '#main-content');
    addSkipLink(t('accessibility.skip_to_navigation', 'Skip to navigation'), '#navigation');
  }, [t, addSkipLink]);
  
  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    ariaLabels,
    setAriaLabel,
    getAriaLabel,
    announce: announceMessage,
    focusManager,
    setFocusManager,
    focusElement,
    keyboardShortcuts,
    registerShortcut,
    unregisterShortcut,
    skipLinks,
    addSkipLink,
    removeSkipLink,
  };
  
  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Skip Links */}
      <div className="sr-only focus-within:not-sr-only">
        {skipLinks.map((link, index) => (
          <a
            key={link.target}
            href={link.target}
            className="absolute top-0 left-0 z-50 p-2 bg-blue-600 text-white text-sm font-medium rounded-br focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onFocus={() => announceMessage(link.label)}
          >
            {link.label}
          </a>
        ))}
      </div>
      
      {/* Main Content with Focus Trap */}
      {focusManager.trapFocus ? (
        <FocusTrap
          focusTrapOptions={{
            initialFocus: focusManager.initialFocus?.current || undefined,
            returnFocusOnDeactivate: focusManager.restoreFocus,
            clickOutsideDeactivates: true,
          }}
        >
          <div>{children}</div>
        </FocusTrap>
      ) : (
        children
      )}
      
      {/* Screen Reader Announcements Region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="aria-live-region"
      />
      
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="aria-live-region-assertive"
      />
    </AccessibilityContext.Provider>
  );
};

// Hook for managing focus trap
export const useFocusTrap = (active: boolean, options?: Partial<FocusManager>) => {
  const { setFocusManager } = useAccessibility();
  
  useEffect(() => {
    if (active) {
      setFocusManager({
        trapFocus: true,
        ...options,
      });
    } else {
      setFocusManager({
        trapFocus: false,
        restoreFocus: true,
      });
    }
    
    return () => {
      setFocusManager({ trapFocus: false });
    };
  }, [active, options, setFocusManager]);
};

// Hook for keyboard shortcuts
export const useKeyboardShortcut = (key: string, callback: () => void, deps: React.DependencyList = []) => {
  const { registerShortcut, unregisterShortcut } = useAccessibility();
  
  useEffect(() => {
    registerShortcut(key, callback);
    return () => unregisterShortcut(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, registerShortcut, unregisterShortcut, ...deps]);
};

// Hook for accessible announcements
export const useAnnouncement = () => {
  const { announce } = useAccessibility();
  return announce;
};

export default AccessibilityProvider;