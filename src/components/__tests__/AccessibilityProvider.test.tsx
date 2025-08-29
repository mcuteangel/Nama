import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import AccessibilityProvider from '../AccessibilityProvider';
import { useAccessibility } from '../accessibilityHooks';

// Mock @react-aria/live-announcer
vi.mock('@react-aria/live-announcer', () => ({
  announce: vi.fn(),
}));

// Mock focus-trap-react
vi.mock('focus-trap-react', () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => <div data-testid="focus-trap">{children}</div>,
}));

import { announce } from '@react-aria/live-announcer';
const mockAnnounce = vi.mocked(announce);

describe('AccessibilityProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock speechSynthesis for screen reader detection
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {},
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Provider Setup', () => {
    it('provides accessibility context to children', () => {
      const TestComponent = () => {
        const { settings } = useAccessibility();
        return <div>{settings.keyboardNavigation ? 'Keyboard Enabled' : 'Keyboard Disabled'}</div>;
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByText('Keyboard Enabled')).toBeInTheDocument();
    });

    it('throws error when used outside provider', () => {
      const TestComponent = () => {
        useAccessibility();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useAccessibility must be used within an AccessibilityProvider'
      );

      consoleSpy.mockRestore();
    });

    it('applies initial settings correctly', () => {
      const initialSettings = {
        reduceMotion: true,
        highContrast: true,
        keyboardNavigation: false,
      };

      const TestComponent = () => {
        const { settings } = useAccessibility();
        return (
          <div>
            <span data-testid="reduce-motion">{settings.reduceMotion.toString()}</span>
            <span data-testid="high-contrast">{settings.highContrast.toString()}</span>
            <span data-testid="keyboard-nav">{settings.keyboardNavigation.toString()}</span>
          </div>
        );
      };

      render(
        <AccessibilityProvider initialSettings={initialSettings}>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('reduce-motion')).toHaveTextContent('true');
      expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
      expect(screen.getByTestId('keyboard-nav')).toHaveTextContent('false');
    });
  });

  describe('Settings Management', () => {
    it('updates settings correctly', () => {
      const TestComponent = () => {
        const { settings, updateSettings } = useAccessibility();
        
        const handleToggle = () => {
          updateSettings({ keyboardNavigation: !settings.keyboardNavigation });
        };

        return (
          <div>
            <span data-testid="keyboard-status">
              {settings.keyboardNavigation ? 'Enabled' : 'Disabled'}
            </span>
            <button onClick={handleToggle}>Toggle</button>
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('keyboard-status')).toHaveTextContent('Enabled');

      const button = screen.getByText('Toggle');
      fireEvent.click(button);

      expect(screen.getByTestId('keyboard-status')).toHaveTextContent('Disabled');
    });

    it('detects screen reader automatically', () => {
      // Mock navigator.userAgent to include screen reader
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NVDA/2021.1',
      });

      const TestComponent = () => {
        const { settings } = useAccessibility();
        return (
          <div data-testid="screen-reader">
            {settings.screenReaderOptimized ? 'Optimized' : 'Not Optimized'}
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('screen-reader')).toHaveTextContent('Optimized');
    });
  });

  describe('ARIA Labels Management', () => {
    it('sets and gets ARIA labels correctly', () => {
      const TestComponent = () => {
        const { setAriaLabel, getAriaLabel } = useAccessibility();
        
        React.useEffect(() => {
          setAriaLabel('test-button', 'Test Button Label');
        }, [setAriaLabel]);

        return (
          <div>
            <span data-testid="aria-label">
              {getAriaLabel('test-button', 'Default Label')}
            </span>
            <span data-testid="fallback-label">
              {getAriaLabel('non-existent', 'Fallback Label')}
            </span>
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('aria-label')).toHaveTextContent('Test Button Label');
      expect(screen.getByTestId('fallback-label')).toHaveTextContent('Fallback Label');
    });

    it('returns key when no label or fallback provided', () => {
      const TestComponent = () => {
        const { getAriaLabel } = useAccessibility();
        return <span data-testid="key-label">{getAriaLabel('unknown-key')}</span>;
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('key-label')).toHaveTextContent('unknown-key');
    });
  });

  describe('Live Region Announcements', () => {
    it('announces messages with default priority', () => {
      const TestComponent = () => {
        const { announce } = useAccessibility();
        
        React.useEffect(() => {
          announce('Test message');
        }, [announce]);

        return <div>Test</div>;
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(mockAnnounce).toHaveBeenCalledWith('Test message', 'polite');
    });

    it('announces messages with custom priority', () => {
      const TestComponent = () => {
        const { announce } = useAccessibility();
        
        React.useEffect(() => {
          announce('Urgent message', 'assertive');
        }, [announce]);

        return <div>Test</div>;
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(mockAnnounce).toHaveBeenCalledWith('Urgent message', 'assertive');
    });

    it('respects announceChanges setting', () => {
      const initialSettings = { announceChanges: false };

      const TestComponent = () => {
        const { announce } = useAccessibility();
        
        React.useEffect(() => {
          announce('Should not announce');
        }, [announce]);

        return <div>Test</div>;
      };

      render(
        <AccessibilityProvider initialSettings={initialSettings}>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(mockAnnounce).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('focuses element when keyboard navigation enabled', () => {
      const mockElement = {
        focus: vi.fn(),
        getAttribute: vi.fn().mockReturnValue(null),
        textContent: 'Test Element',
      } as unknown as HTMLElement;

      const TestComponent = () => {
        const { focusElement } = useAccessibility();
        
        React.useEffect(() => {
          focusElement(mockElement);
        }, [focusElement]);

        return <div>Test</div>;
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(mockElement.focus).toHaveBeenCalled();
    });

    it('does not focus when keyboard navigation disabled', () => {
      const mockElement = {
        focus: vi.fn(),
      } as unknown as HTMLElement;

      const initialSettings = { keyboardNavigation: false };

      const TestComponent = () => {
        const { focusElement } = useAccessibility();
        
        React.useEffect(() => {
          focusElement(mockElement);
        }, [focusElement]);

        return <div>Test</div>;
      };

      render(
        <AccessibilityProvider initialSettings={initialSettings}>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(mockElement.focus).not.toHaveBeenCalled();
    });

    it('updates focus manager settings', () => {
      const TestComponent = () => {
        const { focusManager, setFocusManager } = useAccessibility();
        
        React.useEffect(() => {
          setFocusManager({ trapFocus: true, restoreFocus: false });
        }, [setFocusManager]);

        return (
          <div>
            <span data-testid="trap-focus">{focusManager.trapFocus.toString()}</span>
            <span data-testid="restore-focus">{focusManager.restoreFocus.toString()}</span>
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('trap-focus')).toHaveTextContent('true');
      expect(screen.getByTestId('restore-focus')).toHaveTextContent('false');
    });

    it('focuses element with custom label', () => {
      const mockElement = {
        focus: vi.fn(),
        getAttribute: vi.fn().mockReturnValue('Custom Label'),
        textContent: 'Test Element',
      } as unknown as HTMLElement;

      const TestComponent = () => {
        const { focusElement } = useAccessibility();
        
        React.useEffect(() => {
          focusElement(mockElement);
        }, [focusElement]);

        return <div>Test</div>;
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(mockElement.focus).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('registers and executes keyboard shortcuts', async () => {
      const mockCallback = vi.fn();
      const user = userEvent.setup();

      const TestComponent = () => {
        const { registerShortcut } = useAccessibility();
        
        React.useEffect(() => {
          registerShortcut('ctrl+k', mockCallback);
        }, [registerShortcut]);

        return <div>Test</div>;
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      // Simulate Ctrl+K
      await user.keyboard('{Control>}k{/Control}');

      expect(mockCallback).toHaveBeenCalled();
    });

    it('unregisters keyboard shortcuts', async () => {
      const mockCallback = vi.fn();
      const user = userEvent.setup();

      const TestComponent = () => {
        const { registerShortcut, unregisterShortcut } = useAccessibility();
        
        React.useEffect(() => {
          registerShortcut('ctrl+k', mockCallback);
          unregisterShortcut('ctrl+k');
        }, [registerShortcut, unregisterShortcut]);

        return <div>Test</div>;
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      await user.keyboard('{Control>}k{/Control}');

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('ignores shortcuts when keyboard navigation disabled', async () => {
      const mockCallback = vi.fn();
      const user = userEvent.setup();
      const initialSettings = { keyboardNavigation: false };

      const TestComponent = () => {
        const { registerShortcut } = useAccessibility();
        
        React.useEffect(() => {
          registerShortcut('ctrl+k', mockCallback);
        }, [registerShortcut]);

        return <div>Test</div>;
      };

      render(
        <AccessibilityProvider initialSettings={initialSettings}>
          <TestComponent />
        </AccessibilityProvider>
      );

      await user.keyboard('{Control>}k{/Control}');

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Skip Links Management', () => {
    it('adds and removes skip links', () => {
      const TestComponent = () => {
        const { skipLinks, addSkipLink, removeSkipLink } = useAccessibility();
        
        const handleAdd = () => {
          addSkipLink('Skip to content', '#content');
        };

        const handleRemove = () => {
          removeSkipLink('#content');
        };

        return (
          <div>
            <div data-testid="skip-links-count">{skipLinks.length}</div>
            <button onClick={handleAdd}>Add Skip Link</button>
            <button onClick={handleRemove}>Remove Skip Link</button>
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('skip-links-count')).toHaveTextContent('0');

      fireEvent.click(screen.getByText('Add Skip Link'));
      expect(screen.getByTestId('skip-links-count')).toHaveTextContent('1');

      fireEvent.click(screen.getByText('Remove Skip Link'));
      expect(screen.getByTestId('skip-links-count')).toHaveTextContent('0');
    });

    it('prevents duplicate skip links', () => {
      const TestComponent = () => {
        const { skipLinks, addSkipLink } = useAccessibility();
        
        const handleAdd = () => {
          addSkipLink('Skip to content', '#content');
        };

        return (
          <div>
            <div data-testid="skip-links-count">{skipLinks.length}</div>
            <button onClick={handleAdd}>Add Skip Link</button>
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      // Add same skip link twice
      fireEvent.click(screen.getByText('Add Skip Link'));
      fireEvent.click(screen.getByText('Add Skip Link'));

      // Should still only have 1 skip link
      expect(screen.getByTestId('skip-links-count')).toHaveTextContent('1');
    });
  });

  describe('Accessibility Hook', () => {
    it('provides all expected context methods', () => {
      const { result } = renderHook(() => useAccessibility(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AccessibilityProvider>{children}</AccessibilityProvider>
        ),
      });

      expect(result.current).toHaveProperty('settings');
      expect(result.current).toHaveProperty('updateSettings');
      expect(result.current).toHaveProperty('ariaLabels');
      expect(result.current).toHaveProperty('setAriaLabel');
      expect(result.current).toHaveProperty('getAriaLabel');
      expect(result.current).toHaveProperty('announce');
      expect(result.current).toHaveProperty('focusManager');
      expect(result.current).toHaveProperty('setFocusManager');
      expect(result.current).toHaveProperty('focusElement');
      expect(result.current).toHaveProperty('keyboardShortcuts');
      expect(result.current).toHaveProperty('registerShortcut');
      expect(result.current).toHaveProperty('unregisterShortcut');
      expect(result.current).toHaveProperty('skipLinks');
      expect(result.current).toHaveProperty('addSkipLink');
      expect(result.current).toHaveProperty('removeSkipLink');
    });
  });

  describe('Media Queries Integration', () => {
    it('respects prefers-reduced-motion', () => {
      // Mock matchMedia to return true for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('reduce'),
          media: query,
        })),
      });

      const TestComponent = () => {
        const { settings } = useAccessibility();
        return (
          <span data-testid="reduce-motion">
            {settings.reduceMotion.toString()}
          </span>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('reduce-motion')).toHaveTextContent('true');
    });

    it('respects prefers-contrast', () => {
      // Mock matchMedia to return true for high contrast
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('high'),
          media: query,
        })),
      });

      const TestComponent = () => {
        const { settings } = useAccessibility();
        return (
          <span data-testid="high-contrast">
            {settings.highContrast.toString()}
          </span>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
    });
  });
});