import { useState, useEffect } from 'react';

const DEBUG_STORAGE_KEY = 'nama_debug_mode';

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    // Check if we're in development environment or debug mode is enabled
    const stored = localStorage.getItem(DEBUG_STORAGE_KEY);
    return process.env.NODE_ENV === 'development' || stored === 'true';
  });

  const [showDebugPanel, setShowDebugPanel] = useState(() => {
    return localStorage.getItem('nama_debug_panel') === 'true';
  });

  const enableDebugMode = () => {
    setIsDebugMode(true);
    localStorage.setItem(DEBUG_STORAGE_KEY, 'true');
  };

  const disableDebugMode = () => {
    setIsDebugMode(false);
    localStorage.setItem(DEBUG_STORAGE_KEY, 'false');
  };

  const toggleDebugPanel = () => {
    setShowDebugPanel(prev => {
      const newState = !prev;
      localStorage.setItem('nama_debug_panel', newState.toString());
      return newState;
    });
  };

  // Log debug state changes
  useEffect(() => {
    if (isDebugMode) {
      console.log('🔧 Debug Mode Enabled');
    }
  }, [isDebugMode]);

  return {
    isDebugMode,
    showDebugPanel,
    enableDebugMode,
    disableDebugMode,
    toggleDebugPanel,
    isDevelopment: process.env.NODE_ENV === 'development'
  };
};
