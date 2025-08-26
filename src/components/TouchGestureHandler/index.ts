// Export the main component
export { default as TouchGestureHandler } from '../TouchGestureHandler';

// Export types
export type { TouchGestureConfig, GestureCallbacks } from './types';

// Export hooks and HOC
export { useTouchGestures, withTouchGestures } from './hooks.tsx';