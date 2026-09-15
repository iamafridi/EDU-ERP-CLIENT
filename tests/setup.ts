import '@testing-library/jest-dom';

// jsdom does not implement window.matchMedia; polyfill it so components
// using prefers-reduced-motion can render in tests.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated API, kept for legacy consumers
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
