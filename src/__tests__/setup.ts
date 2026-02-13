/**
 * Vitest Global Setup File
 * Runs before all tests - sets up jsdom, mocks, and global utilities
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, beforeAll, afterAll, vi, expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Extend Vitest expect with jest-axe matchers
expect.extend(toHaveNoViolations);
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';
import { resetMockStores } from './mocks/handlers';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// MSW Server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  resetMockStores(); // Reset mock data stores between tests
});
afterAll(() => server.close());

// Mock window.matchMedia
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }));
});

// Mock requestAnimationFrame for hooks that use it
// Using proper ID tracking and Promise.resolve() for async execution without timer conflicts
let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();

beforeAll(() => {
  global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
    const id = ++rafId;
    rafCallbacks.set(id, cb);
    // Use Promise.resolve().then() for proper async execution that won't conflict with fake timers
    Promise.resolve().then(() => {
      const callback = rafCallbacks.get(id);
      if (callback) {
        rafCallbacks.delete(id);
        callback(performance.now());
      }
    });
    return id;
  });

  global.cancelAnimationFrame = vi.fn((id: number) => {
    rafCallbacks.delete(id);
  });
});

// Reset RAF ID counter before each test for consistent behavior
beforeEach(() => {
  rafId = 0;
});

// Clear pending RAF callbacks after each test to prevent leaks
afterEach(() => {
  rafCallbacks.clear();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Note: Do NOT mock navigator.clipboard here as it conflicts with @testing-library/user-event
// user-event handles clipboard mocking internally

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();
