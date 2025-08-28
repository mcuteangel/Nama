import React from 'react';
import { TouchGestureConfig, GestureCallbacks } from './TouchGestureHandler.types';
import TouchGestureHandler from './TouchGestureHandler';

// Hooks
export const useTouchGestures = (callbacks: GestureCallbacks, config?: TouchGestureConfig) => {
  const gestureProps = React.useMemo(() => ({
    callbacks,
    config,
  }), [callbacks, config]);

  return gestureProps;
};

// Higher-order component for wrapping components
export const withTouchGestures = <P extends object>(
  Component: React.ComponentType<P>,
  gestureConfig?: TouchGestureConfig,
  gestureCallbacks?: GestureCallbacks
) => {
  const WithTouchGestures: React.FC<P> = (props) => 
    React.createElement(
      TouchGestureHandler,
      { 
        config: gestureConfig, 
        callbacks: gestureCallbacks
      },
      [React.createElement(Component, props as P)]
    );

  WithTouchGestures.displayName = `withTouchGestures(${Component.displayName || Component.name})`;
  
  return WithTouchGestures;
};

export default withTouchGestures;