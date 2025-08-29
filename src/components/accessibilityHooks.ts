import { useEffect, useContext } from 'react';
import type { AccessibilityContextType, FocusManager } from './AccessibilityContext';
import { AccessibilityContext } from './AccessibilityContext';

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
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