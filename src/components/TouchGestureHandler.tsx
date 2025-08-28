import React, { useRef, useCallback, useMemo } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TouchGestureConfig, GestureCallbacks } from './TouchGestureHandler.types';

interface TouchGestureHandlerProps {
  children?: React.ReactNode;
  config?: TouchGestureConfig;
  callbacks?: GestureCallbacks;
  className?: string;
  disabled?: boolean;
  enableTransform?: boolean;
  enableDrag?: boolean;
}

const DEFAULT_CONFIG: Required<TouchGestureConfig> = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.5,
  pinchThreshold: 0.1,
  maxPinchScale: 3,
  minPinchScale: 0.5,
  tapThreshold: 10,
  doubleTapDelay: 300,
  longPressDelay: 500,
  springConfig: config.default,
  enableHapticFeedback: true,
};

export const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = React.memo(({
  children,
  config: userConfig = {},
  callbacks = {},
  className = '',
  disabled = false,
  enableTransform = false,
  enableDrag = false,
}) => {
  const isMobile = useIsMobile();
  const gestureConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...userConfig }), [userConfig]);
  
  // Refs for gesture state
  const lastTapTime = useRef<number>(0);
  const tapCount = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isDragging = useRef<boolean>(false);

  // Spring animations
  const [{ x, y, scale, opacity }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    config: gestureConfig.springConfig,
  }));

  // Haptic feedback function
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!gestureConfig.enableHapticFeedback || !isMobile) return;
    
    // Haptic feedback for supported devices
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  }, [gestureConfig.enableHapticFeedback, isMobile]);

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Gesture handlers
  const bind = useGesture(
    {
      // Drag gesture
      onDrag: ({ active, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], first, last }) => {
        if (disabled || !enableDrag) return;

        if (first) {
          isDragging.current = true;
          callbacks.onDragStart?.();
          clearLongPressTimer();
        }

        if (active) {
          callbacks.onDrag?.({ x: mx, y: my });
          if (enableTransform) {
            api.start({ x: mx, y: my });
          }
        }

        if (last) {
          isDragging.current = false;
          callbacks.onDragEnd?.();
          
          // Check for swipe gestures
          const absVx = Math.abs(vx);
          const absVy = Math.abs(vy);
          const absMx = Math.abs(mx);
          const absMy = Math.abs(my);

          if (absVx > gestureConfig.swipeVelocityThreshold || absMx > gestureConfig.swipeThreshold) {
            if (dx > 0) {
              callbacks.onSwipeRight?.();
              triggerHapticFeedback('medium');
            } else {
              callbacks.onSwipeLeft?.();
              triggerHapticFeedback('medium');
            }
          } else if (absVy > gestureConfig.swipeVelocityThreshold || absMy > gestureConfig.swipeThreshold) {
            if (dy > 0) {
              callbacks.onSwipeDown?.();
              triggerHapticFeedback('medium');
            } else {
              callbacks.onSwipeUp?.();
              triggerHapticFeedback('medium');
            }
          }

          // Reset position if transform is enabled
          if (enableTransform) {
            api.start({ x: 0, y: 0 });
          }
        }
      },

      // Pinch gesture
      onPinch: ({ active, da: [d], first, last }) => {
        if (disabled) return;

        const newScale = Math.max(
          gestureConfig.minPinchScale,
          Math.min(gestureConfig.maxPinchScale, 1 + d / 100)
        );

        if (first) {
          callbacks.onPinchStart?.(newScale);
          triggerHapticFeedback('light');
        }

        callbacks.onPinch?.(newScale);
        
        if (enableTransform) {
          api.start({ scale: active ? newScale : 1 });
        }

        if (last) {
          callbacks.onPinchEnd?.(newScale);
        }
      },

      // Touch/Click handlers
      onPointerDown: ({ event }) => {
        if (disabled) return;

        const { clientX, clientY } = event as PointerEvent;
        
        // Setup long press timer
        longPressTimer.current = setTimeout(() => {
          if (!isDragging.current) {
            callbacks.onLongPress?.({ x: clientX, y: clientY });
            triggerHapticFeedback('heavy');
          }
        }, gestureConfig.longPressDelay);
      },

      onPointerUp: ({ event }) => {
        if (disabled) return;

        clearLongPressTimer();

        if (isDragging.current) {
          isDragging.current = false;
          return;
        }

        const { clientX, clientY } = event as PointerEvent;
        const currentTime = Date.now();
        
        // Handle taps
        if (currentTime - lastTapTime.current < gestureConfig.doubleTapDelay) {
          tapCount.current += 1;
        } else {
          tapCount.current = 1;
        }

        lastTapTime.current = currentTime;

        // Handle double tap
        if (tapCount.current === 2) {
          callbacks.onDoubleTap?.({ x: clientX, y: clientY });
          triggerHapticFeedback('medium');
          tapCount.current = 0;
        } else {
          // Single tap with delay to check for double tap
          setTimeout(() => {
            if (tapCount.current === 1) {
              callbacks.onTap?.({ x: clientX, y: clientY });
              triggerHapticFeedback('light');
            }
            tapCount.current = 0;
          }, gestureConfig.doubleTapDelay);
        }
      },
    },
    {
      drag: {
        threshold: gestureConfig.tapThreshold,
        preventDefaultAxis: 'xy',
      },
      pinch: {
        threshold: gestureConfig.pinchThreshold,
        preventDefaultAxis: 'xy',
      },
    }
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  if (!isMobile && !enableTransform && !enableDrag) {
    // On desktop without transform/drag, return children without gesture handling
    return <div className={className}>{children}</div>;
  }

  if (enableTransform) {
    return (
      <animated.div
        {...bind()}
        style={{
          x,
          y,
          scale,
          opacity,
          touchAction: 'none',
        }}
        className={`select-none ${className}`}
      >
        {children}
      </animated.div>
    );
  }

  return (
    <div
      {...bind()}
      style={{ touchAction: 'pan-y' }}
      className={`select-none w-full ${className}`}
    >
      {children}
    </div>
  );
});

TouchGestureHandler.displayName = 'TouchGestureHandler';

export default TouchGestureHandler;
