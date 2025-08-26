import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TouchGestureHandler, { useTouchGestures, withTouchGestures } from '../TouchGestureHandler';

// Mock dependencies
vi.mock('@/hooks/use-mobile');
vi.mock('react-spring', () => ({
  useSpring: vi.fn(() => [
    { x: 0, y: 0, scale: 1, opacity: 1 },
    { start: vi.fn(), stop: vi.fn(), set: vi.fn() }
  ]),
  animated: {
    div: 'div',
  },
  config: {
    default: {},
  },
}));

vi.mock('@use-gesture/react', () => ({
  useGesture: vi.fn((handlers, config) => () => ({
    onPointerDown: handlers.onPointerDown,
    onPointerUp: handlers.onPointerUp,
    onDrag: handlers.onDrag,
    onPinch: handlers.onPinch,
  })),
}));

const mockUseMobile = vi.mocked(require('@/hooks/use-mobile').useMobile);
const mockUseGesture = vi.mocked(require('@use-gesture/react').useGesture);
const mockUseSpring = vi.mocked(require('react-spring').useSpring);

describe('TouchGestureHandler', () => {
  const mockCallbacks = {
    onTap: vi.fn(),
    onDoubleTap: vi.fn(),
    onLongPress: vi.fn(),
    onSwipeLeft: vi.fn(),
    onSwipeRight: vi.fn(),
    onSwipeUp: vi.fn(),
    onSwipeDown: vi.fn(),
    onPinch: vi.fn(),
    onPinchStart: vi.fn(),
    onPinchEnd: vi.fn(),
    onDrag: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMobile.mockReturnValue(true);
    
    // Mock navigator.vibrate
    global.navigator.vibrate = vi.fn();
    
    // Reset useSpring mock
    mockUseSpring.mockReturnValue([
      { x: 0, y: 0, scale: 1, opacity: 1 },
      { 
        start: vi.fn(),
        stop: vi.fn(),
        set: vi.fn()
      }
    ]);
  });

  describe('Rendering', () => {
    it('renders children on mobile', () => {
      mockUseMobile.mockReturnValue(true);
      
      render(
        <TouchGestureHandler>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders children on desktop without gestures', () => {
      mockUseMobile.mockReturnValue(false);
      
      render(
        <TouchGestureHandler>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <TouchGestureHandler className="custom-class">
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      const container = screen.getByText('Test Content').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('applies select-none class for gesture prevention', () => {
      render(
        <TouchGestureHandler>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      const container = screen.getByText('Test Content').parentElement;
      expect(container).toHaveClass('select-none');
    });
  });

  describe('Gesture Configuration', () => {
    it('uses default configuration when none provided', () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      expect(mockUseGesture).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          drag: expect.objectContaining({
            threshold: 10, // Default tap threshold
          }),
          pinch: expect.objectContaining({
            threshold: 0.1, // Default pinch threshold
          }),
        })
      );
    });

    it('merges custom configuration with defaults', () => {
      const customConfig = {
        swipeThreshold: 100,
        tapThreshold: 20,
      };

      render(
        <TouchGestureHandler config={customConfig} callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      expect(mockUseGesture).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          drag: expect.objectContaining({
            threshold: 20, // Custom tap threshold
          }),
        })
      );
    });
  });

  describe('Touch Events', () => {
    let gestureHandlers: any;

    beforeEach(() => {
      mockUseGesture.mockImplementation((handlers) => {
        gestureHandlers = handlers;
        return () => ({});
      });
    });

    it('handles tap events', async () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      // Simulate pointer down and up for tap
      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
      } as PointerEventInit);

      gestureHandlers.onPointerDown({ event: pointerEvent });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      gestureHandlers.onPointerUp({ event: pointerEvent });

      // Wait for tap delay
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(mockCallbacks.onTap).toHaveBeenCalledWith({ x: 100, y: 100 });
    });

    it('handles double tap events', async () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
      } as PointerEventInit);

      // First tap
      gestureHandlers.onPointerDown({ event: pointerEvent });
      gestureHandlers.onPointerUp({ event: pointerEvent });

      // Second tap quickly
      gestureHandlers.onPointerDown({ event: pointerEvent });
      gestureHandlers.onPointerUp({ event: pointerEvent });

      expect(mockCallbacks.onDoubleTap).toHaveBeenCalledWith({ x: 100, y: 100 });
    });

    it('handles long press events', async () => {
      vi.useFakeTimers();
      
      render(
        <TouchGestureHandler callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
      } as PointerEventInit);

      gestureHandlers.onPointerDown({ event: pointerEvent });
      
      // Fast-forward past long press delay
      vi.advanceTimersByTime(500);

      expect(mockCallbacks.onLongPress).toHaveBeenCalledWith({ x: 100, y: 100 });
      
      vi.useRealTimers();
    });
  });

  describe('Drag Gestures', () => {
    let gestureHandlers: any;

    beforeEach(() => {
      mockUseGesture.mockImplementation((handlers) => {
        gestureHandlers = handlers;
        return () => ({});
      });
    });

    it('handles drag start, move, and end', () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks} enableDrag>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      // Drag start
      gestureHandlers.onDrag({
        active: true,
        first: true,
        movement: [10, 10],
        velocity: [0.1, 0.1],
        direction: [1, 1],
      });

      expect(mockCallbacks.onDragStart).toHaveBeenCalled();

      // Drag move
      gestureHandlers.onDrag({
        active: true,
        movement: [20, 20],
        velocity: [0.2, 0.2],
        direction: [1, 1],
      });

      expect(mockCallbacks.onDrag).toHaveBeenCalledWith({ x: 20, y: 20 });

      // Drag end
      gestureHandlers.onDrag({
        active: false,
        last: true,
        movement: [30, 30],
        velocity: [0.3, 0.3],
        direction: [1, 1],
      });

      expect(mockCallbacks.onDragEnd).toHaveBeenCalled();
    });

    it('ignores drag when disabled', () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks} enableDrag={false}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      gestureHandlers.onDrag({
        active: true,
        first: true,
        movement: [10, 10],
        velocity: [0.1, 0.1],
        direction: [1, 1],
      });

      expect(mockCallbacks.onDragStart).not.toHaveBeenCalled();
    });
  });

  describe('Swipe Gestures', () => {
    let gestureHandlers: any;

    beforeEach(() => {
      mockUseGesture.mockImplementation((handlers) => {
        gestureHandlers = handlers;
        return () => ({});
      });
    });

    it('detects swipe right', () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks} enableDrag>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      gestureHandlers.onDrag({
        active: false,
        last: true,
        movement: [100, 0], // Horizontal movement > threshold
        velocity: [0.6, 0], // High horizontal velocity
        direction: [1, 0], // Right direction
      });

      expect(mockCallbacks.onSwipeRight).toHaveBeenCalled();
    });

    it('detects swipe left', () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks} enableDrag>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      gestureHandlers.onDrag({
        active: false,
        last: true,
        movement: [-100, 0],
        velocity: [-0.6, 0],
        direction: [-1, 0],
      });

      expect(mockCallbacks.onSwipeLeft).toHaveBeenCalled();
    });

    it('detects swipe up', () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks} enableDrag>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      gestureHandlers.onDrag({
        active: false,
        last: true,
        movement: [0, -100],
        velocity: [0, -0.6],
        direction: [0, -1],
      });

      expect(mockCallbacks.onSwipeUp).toHaveBeenCalled();
    });

    it('detects swipe down', () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks} enableDrag>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      gestureHandlers.onDrag({
        active: false,
        last: true,
        movement: [0, 100],
        velocity: [0, 0.6],
        direction: [0, 1],
      });

      expect(mockCallbacks.onSwipeDown).toHaveBeenCalled();
    });
  });

  describe('Pinch Gestures', () => {
    let gestureHandlers: any;

    beforeEach(() => {
      mockUseGesture.mockImplementation((handlers) => {
        gestureHandlers = handlers;
        return () => ({});
      });
    });

    it('handles pinch gestures', () => {
      render(
        <TouchGestureHandler callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      // Pinch start
      gestureHandlers.onPinch({
        active: true,
        first: true,
        da: [20], // Distance change
        movement: [0, 0],
      });

      expect(mockCallbacks.onPinchStart).toHaveBeenCalledWith(1.2); // 1 + 20/100

      // Pinch move
      gestureHandlers.onPinch({
        active: true,
        da: [50],
        movement: [0, 0],
      });

      expect(mockCallbacks.onPinch).toHaveBeenCalledWith(1.5);

      // Pinch end
      gestureHandlers.onPinch({
        active: false,
        last: true,
        da: [30],
        movement: [0, 0],
      });

      expect(mockCallbacks.onPinchEnd).toHaveBeenCalledWith(1.3);
    });

    it('respects scale limits', () => {
      const config = {
        maxPinchScale: 2,
        minPinchScale: 0.5,
      };

      render(
        <TouchGestureHandler config={config} callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      // Try to scale beyond maximum
      gestureHandlers.onPinch({
        active: true,
        da: [300], // Would result in scale > 2
        movement: [0, 0],
      });

      expect(mockCallbacks.onPinch).toHaveBeenCalledWith(2); // Clamped to max

      // Try to scale below minimum
      gestureHandlers.onPinch({
        active: true,
        da: [-80], // Would result in scale < 0.5
        movement: [0, 0],
      });

      expect(mockCallbacks.onPinch).toHaveBeenCalledWith(0.5); // Clamped to min
    });
  });

  describe('Haptic Feedback', () => {
    it('triggers haptic feedback for tap', async () => {
      const config = { enableHapticFeedback: true };
      
      render(
        <TouchGestureHandler config={config} callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      const pointerEvent = new PointerEvent('pointerup', {
        clientX: 100,
        clientY: 100,
      } as PointerEventInit);

      // Simulate tap completion
      gestureHandlers.onPointerUp({ event: pointerEvent });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Should trigger light haptic feedback for tap
      expect(navigator.vibrate).toHaveBeenCalledWith([10]);
    });

    it('disables haptic feedback when configured', () => {
      const config = { enableHapticFeedback: false };
      
      render(
        <TouchGestureHandler config={config} callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      // Even with gestures, no haptic feedback should be triggered
      expect(navigator.vibrate).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('ignores all gestures when disabled', () => {
      render(
        <TouchGestureHandler disabled callbacks={mockCallbacks}>
          <div>Test Content</div>
        </TouchGestureHandler>
      );

      const pointerEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
      } as PointerEventInit);

      gestureHandlers.onPointerDown({ event: pointerEvent });
      gestureHandlers.onPointerUp({ event: pointerEvent });

      expect(mockCallbacks.onTap).not.toHaveBeenCalled();
    });
  });
});

describe('useTouchGestures Hook', () => {
  it('returns gesture configuration object', () => {
    const callbacks = { onTap: vi.fn() };
    const config = { tapThreshold: 20 };
    
    const TestComponent = () => {
      const gestureProps = useTouchGestures(callbacks, config);
      expect(gestureProps).toEqual({ callbacks, config });
      return <div>Test</div>;
    };

    render(<TestComponent />);
  });
});

describe('withTouchGestures HOC', () => {
  it('wraps component with gesture handler', () => {
    const TestComponent = ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    );
    
    const EnhancedComponent = withTouchGestures(TestComponent);
    
    render(<EnhancedComponent>Test Content</EnhancedComponent>);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('forwards refs correctly', () => {
    const TestComponent = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
      ({ children }, ref) => <div ref={ref}>{children}</div>
    );
    
    const EnhancedComponent = withTouchGestures(TestComponent);
    const ref = React.createRef<HTMLDivElement>();
    
    render(<EnhancedComponent ref={ref}>Test Content</EnhancedComponent>);
    
    expect(ref.current).toBeTruthy();
  });
});