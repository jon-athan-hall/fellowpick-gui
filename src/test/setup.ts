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

// Combobox scrolls its active option into view on a timer after the dropdown
// opens; jsdom implements no scrolling at all, so the callback threw *after*
// the test that opened the dropdown had already passed. Vitest reported it as
// an unhandled error rather than a failure, which is the shape of thing that
// quietly turns into a false positive later.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
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