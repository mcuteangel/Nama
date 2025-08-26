import React, { useMemo } from 'react';
import { TouchGestureConfig, GestureCallbacks } from './types';
import TouchGestureHandler from '../TouchGestureHandler';

// Hook برای استفاده آسان از TouchGestureHandler
export const useTouchGestures = (callbacks: GestureCallbacks, config?: TouchGestureConfig) => {
  const gestureProps = useMemo(() => ({
    callbacks,
    config,
  }), [callbacks, config]);

  return gestureProps;
};

// Higher-order component برای wrap کردن کامپوننت‌ها
export const withTouchGestures = <P extends object>(
  Component: React.ComponentType<P>,
  gestureConfig?: TouchGestureConfig,
  gestureCallbacks?: GestureCallbacks
) => {
  const WithTouchGestures = React.forwardRef<HTMLElement, P>((props) => (
    <TouchGestureHandler config={gestureConfig} callbacks={gestureCallbacks}>
      <Component {...(props as P)} />
    </TouchGestureHandler>
  ));

  WithTouchGestures.displayName = `withTouchGestures(${Component.displayName || Component.name})`;
  
  return WithTouchGestures;
};