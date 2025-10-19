import { vi } from 'vitest';

// Mock for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // برای مرورگرهای قدیمی
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock for ResizeObserver
type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

class ResizeObserverStub implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {
    // Intentionally empty
  }
  
  observe(_target: Element, _options?: ResizeObserverOptions): void {
    // Intentionally empty
  }
  
  unobserve(_target: Element): void {
    // Intentionally empty
  }
  
  disconnect(): void {
    // Intentionally empty
  }
}

// @ts-ignore - Adding to window for tests
window.ResizeObserver = ResizeObserverStub;
