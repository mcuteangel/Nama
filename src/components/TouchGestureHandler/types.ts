import { config } from 'react-spring';

export interface TouchGestureConfig {
  // Swipe configuration
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  
  // Pinch configuration
  pinchThreshold?: number;
  maxPinchScale?: number;
  minPinchScale?: number;
  
  // Tap configuration
  tapThreshold?: number;
  doubleTapDelay?: number;
  longPressDelay?: number;
  
  // Animation configuration
  springConfig?: typeof config.default;
  
  // Haptic feedback
  enableHapticFeedback?: boolean;
}

export interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchStart?: (scale: number) => void;
  onPinch?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
  onTap?: (position: { x: number; y: number }) => void;
  onDoubleTap?: (position: { x: number; y: number }) => void;
  onLongPress?: (position: { x: number; y: number }) => void;
  onDragStart?: () => void;
  onDrag?: (offset: { x: number; y: number }) => void;
  onDragEnd?: () => void;
}