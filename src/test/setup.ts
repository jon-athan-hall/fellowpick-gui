import '@testing-library/jest-dom/vitest';

// Mantine reads window.matchMedia for color-scheme detection; jsdom doesn't
// implement it, so polyfill a no-op version for tests.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
}

// Mantine's Select / Combobox / Popover use ResizeObserver to track anchor
// dimensions; jsdom doesn't ship it, so a no-op stub keeps tests from
// crashing in components that pull these in.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}