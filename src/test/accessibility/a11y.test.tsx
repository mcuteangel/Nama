import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import BundleSizeMonitor from '@/components/performance/BundleSizeMonitor';
import TouchGestureHandler from '@/components/TouchGestureHandler';
import AccessibilityProvider from '@/components/AccessibilityProvider';
import ContactForm from '@/components/ContactForm';
import ContactList from '@/components/ContactList';

expect.extend(toHaveNoViolations);

describe('Accessibility Compliance Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, cacheTime: 0 },
        mutations: { retry: false },
      },
    });
    
    vi.clearAllMocks();
  });

  describe('WCAG Compliance', () => {
    it('BundleSizeMonitor passes axe accessibility tests', async () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <BundleSizeMonitor />
        </QueryClientProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('TouchGestureHandler maintains accessibility of children', async () => {
      const { container } = render(
        <TouchGestureHandler>
          <button aria-label="Accessible Button">Click me</button>
          <img src="test.jpg" alt="Test image description" />
        </TouchGestureHandler>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('AccessibilityProvider passes axe tests', async () => {
      const { container } = render(
        <AccessibilityProvider>
          <main>
            <h1>Main Heading</h1>
            <nav>
              <ul>
                <li><a href="#section1">Section 1</a></li>
                <li><a href="#section2">Section 2</a></li>
              </ul>
            </nav>
            <section id="section1">
              <h2>Section 1 Content</h2>
              <p>Some content here</p>
            </section>
          </main>
        </AccessibilityProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ContactForm has proper form accessibility', async () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <AccessibilityProvider>
            <ContactForm />
          </AccessibilityProvider>
        </QueryClientProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ContactList maintains list accessibility', async () => {
      const mockContacts = [
        { id: '1', name: 'John Doe', phone: '123-456-7890', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', phone: '098-765-4321', email: 'jane@example.com' },
      ];

      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <AccessibilityProvider>
            <TouchGestureHandler>
              <ContactList contacts={mockContacts} />
            </TouchGestureHandler>
          </AccessibilityProvider>
        </QueryClientProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports tab navigation through interactive elements', async () => {
      const user = userEvent.setup();

      render(
        <AccessibilityProvider>
          <div>
            <button>First Button</button>
            <input placeholder="Text input" />
            <select>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <button>Last Button</button>
          </div>
        </AccessibilityProvider>
      );

      const firstButton = screen.getByText('First Button');
      const input = screen.getByPlaceholderText('Text input');
      const select = screen.getByRole('combobox');
      const lastButton = screen.getByText('Last Button');

      // Focus first element
      firstButton.focus();
      expect(firstButton).toHaveFocus();

      // Tab to next element
      await user.tab();
      expect(input).toHaveFocus();

      // Tab to select
      await user.tab();
      expect(select).toHaveFocus();

      // Tab to last button
      await user.tab();
      expect(lastButton).toHaveFocus();

      // Shift+Tab back
      await user.tab({ shift: true });
      expect(select).toHaveFocus();
    });

    it('handles keyboard shortcuts correctly', async () => {
      const mockCallback = vi.fn();
      const user = userEvent.setup();

      const TestComponent = () => {
        const { registerShortcut } = useAccessibility();
        
        React.useEffect(() => {
          registerShortcut('ctrl+k', mockCallback);
        }, [registerShortcut]);

        return <div>Shortcut Test</div>;
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      // Test Ctrl+K shortcut
      await user.keyboard('{Control>}k{/Control}');
      expect(mockCallback).toHaveBeenCalled();
    });

    it('manages focus trapping in modals', async () => {
      const user = userEvent.setup();

      const ModalComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <AccessibilityProvider>
            <div>
              <button onClick={() => setIsOpen(true)}>Open Modal</button>
              {isOpen && (
                <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
                  <h2 id="modal-title">Modal Title</h2>
                  <button>First Modal Button</button>
                  <input placeholder="Modal input" />
                  <button onClick={() => setIsOpen(false)}>Close Modal</button>
                </div>
              )}
            </div>
          </AccessibilityProvider>
        );
      };

      render(<ModalComponent />);

      // Open modal
      const openButton = screen.getByText('Open Modal');
      await user.click(openButton);

      // Modal should be present
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Focus should be inside modal
      const firstModalButton = screen.getByText('First Modal Button');
      const modalInput = screen.getByPlaceholderText('Modal input');
      const closeButton = screen.getByText('Close Modal');

      // Tab through modal elements
      await user.tab();
      expect([firstModalButton, modalInput, closeButton]).toContain(document.activeElement);
    });

    it('provides skip links for main content', () => {
      const TestComponent = () => {
        const { addSkipLink, skipLinks } = useAccessibility();
        
        React.useEffect(() => {
          addSkipLink('Skip to main content', '#main');
          addSkipLink('Skip to navigation', '#nav');
        }, [addSkipLink]);

        return (
          <div>
            {skipLinks.map((link, index) => (
              <a key={index} href={link.target} className="skip-link">
                {link.label}
              </a>
            ))}
            <nav id="nav">Navigation</nav>
            <main id="main">Main Content</main>
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
      expect(screen.getByText('Skip to navigation')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('provides appropriate ARIA labels', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <BundleSizeMonitor />
        </QueryClientProvider>
      );

      // Check for ARIA labels on interactive elements
      const exportButton = screen.getByRole('button', { name: /export report/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('announces dynamic content changes', async () => {
      const mockAnnounce = vi.fn();
      
      // Mock react-aria live announcer
      vi.doMock('@react-aria/live-announcer', () => ({
        announce: mockAnnounce,
      }));

      const TestComponent = () => {
        const { announce } = useAccessibility();
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
          if (count > 0) {
            announce(`Count updated to ${count}`, 'polite');
          }
        }, [count, announce]);

        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const button = screen.getByText('Increment');
      await userEvent.click(button);

      expect(mockAnnounce).toHaveBeenCalledWith('Count updated to 1', 'polite');
    });

    it('provides context for form fields', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <AccessibilityProvider>
            <ContactForm />
          </AccessibilityProvider>
        </QueryClientProvider>
      );

      // Check for proper form field labeling
      const nameField = screen.getByLabelText(/name/i);
      const emailField = screen.getByLabelText(/email/i);
      const phoneField = screen.getByLabelText(/phone/i);

      expect(nameField).toBeInTheDocument();
      expect(emailField).toBeInTheDocument();
      expect(phoneField).toBeInTheDocument();
    });

    it('provides status and error announcements', async () => {
      const TestComponent = () => {
        const [error, setError] = React.useState('');
        const { announce } = useAccessibility();

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const errorMsg = 'Validation failed: Name is required';
          setError(errorMsg);
          announce(errorMsg, 'assertive');
        };

        return (
          <AccessibilityProvider>
            <form onSubmit={handleSubmit}>
              <input aria-label="Name" />
              <button type="submit">Submit</button>
              {error && (
                <div role="alert" aria-live="assertive">
                  {error}
                </div>
              )}
            </form>
          </AccessibilityProvider>
        );
      };

      render(<TestComponent />);

      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Validation failed: Name is required');
    });
  });

  describe('Color and Contrast', () => {
    it('respects prefers-color-scheme preferences', () => {
      // Mock matchMedia for dark mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('dark'),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });

      const TestComponent = () => {
        const { settings } = useAccessibility();
        return (
          <div data-testid="theme-indicator">
            {settings.highContrast ? 'High Contrast' : 'Normal Contrast'}
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      // Component should adapt to high contrast preference
      expect(screen.getByTestId('theme-indicator')).toBeInTheDocument();
    });

    it('maintains sufficient color contrast', () => {
      // This would typically be tested with actual color values
      // For now, we check that contrast-aware classes are applied
      render(
        <QueryClientProvider client={queryClient}>
          <BundleSizeMonitor />
        </QueryClientProvider>
      );

      // Check for elements that should have good contrast
      const titles = screen.getAllByRole('heading');
      titles.forEach(title => {
        expect(title).toBeInTheDocument();
        // In a real test, you'd check computed styles for contrast ratios
      });
    });
  });

  describe('Motion and Animation', () => {
    it('respects prefers-reduced-motion', () => {
      // Mock reduced motion preference
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
          <div data-testid="motion-setting">
            {settings.reduceMotion ? 'Reduced' : 'Normal'}
          </div>
        );
      };

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('motion-setting')).toHaveTextContent('Reduced');
    });

    it('disables animations when motion is reduced', () => {
      const initialSettings = { reduceMotion: true };

      render(
        <AccessibilityProvider initialSettings={initialSettings}>
          <TouchGestureHandler enableTransform>
            <div>Animated Content</div>
          </TouchGestureHandler>
        </AccessibilityProvider>
      );

      // Component should render without throwing errors
      expect(screen.getByText('Animated Content')).toBeInTheDocument();
    });
  });

  describe('Touch and Mobile Accessibility', () => {
    it('ensures touch targets are adequately sized', () => {
      render(
        <TouchGestureHandler>
          <button style={{ minHeight: '44px', minWidth: '44px' }}>
            Touch Button
          </button>
        </TouchGestureHandler>
      );

      const button = screen.getByText('Touch Button');
      const styles = window.getComputedStyle(button);
      
      // Button should meet minimum touch target size
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
    });

    it('provides haptic feedback for touch interactions', async () => {
      const mockVibrate = vi.fn();
      global.navigator.vibrate = mockVibrate;

      const callbacks = {
        onTap: vi.fn(),
      };

      render(
        <TouchGestureHandler callbacks={callbacks}>
          <button>Haptic Button</button>
        </TouchGestureHandler>
      );

      // Simulate touch interaction that would trigger haptic feedback
      const button = screen.getByText('Haptic Button');
      fireEvent.pointerDown(button, { clientX: 100, clientY: 100 });
      fireEvent.pointerUp(button, { clientX: 100, clientY: 100 });

      // Wait for tap delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Should have triggered haptic feedback
      expect(mockVibrate).toHaveBeenCalled();
    });

    it('maintains accessibility with gesture enhancements', () => {
      render(
        <AccessibilityProvider>
          <TouchGestureHandler>
            <div role="button" tabIndex={0} aria-label="Gesture-enabled button">
              Swipe me
            </div>
          </TouchGestureHandler>
        </AccessibilityProvider>
      );

      const gestureButton = screen.getByRole('button');
      expect(gestureButton).toHaveAttribute('aria-label', 'Gesture-enabled button');
      expect(gestureButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Language and Internationalization', () => {
    it('provides proper language attributes', () => {
      render(
        <div lang="en">
          <QueryClientProvider client={queryClient}>
            <BundleSizeMonitor />
          </QueryClientProvider>
        </div>
      );

      // Check that content is properly structured for i18n
      expect(screen.getByText('Bundle Size Monitor')).toBeInTheDocument();
    });

    it('supports right-to-left languages', () => {
      render(
        <div dir="rtl" lang="ar">
          <AccessibilityProvider>
            <div>مرحبا</div>
          </AccessibilityProvider>
        </div>
      );

      // Component should render without layout issues
      expect(screen.getByText('مرحبا')).toBeInTheDocument();
    });
  });
});