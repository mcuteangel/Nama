import { useState, useEffect } from 'react';

const DEBUG_MODE_KEY = 'nama1_debug_mode';

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    // Only allow debug mode in development
    if (process.env.NODE_ENV !== 'development') {
      return false;
    }
    
    // Get from localStorage if available
    const saved = localStorage.getItem(DEBUG_MODE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDebugMode = () => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Debug mode is only available in development environment');
      return;
    }
    
    setIsDebugMode((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem(DEBUG_MODE_KEY, JSON.stringify(newValue));
      console.log(`🔧 Debug mode ${newValue ? 'enabled' : 'disabled'}`);
      return newValue;
    });
  };

  const enableDebugMode = () => {
    if (process.env.NODE_ENV !== 'development') return;
    setIsDebugMode(true);
    localStorage.setItem(DEBUG_MODE_KEY, JSON.stringify(true));
  };

  const disableDebugMode = () => {
    setIsDebugMode(false);
    localStorage.setItem(DEBUG_MODE_KEY, JSON.stringify(false));
  };

  // Expose debug mode status globally for easy console access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as any).debugMode = {
        enabled: isDebugMode,
        toggle: toggleDebugMode,
        enable: enableDebugMode,
        disable: disableDebugMode,
      };
    }
  }, [isDebugMode]);

  return {
    isDebugMode,
    toggleDebugMode,
    enableDebugMode,
    disableDebugMode,
    isDevelopment: process.env.NODE_ENV === 'development',
  };
};