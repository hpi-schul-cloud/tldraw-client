// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Suppress known warnings from dependencies that we cannot fix:
// - Zustand deprecation warnings from @tldraw/tldraw (uses old zustand import syntax)
// - React act() warnings from TldrawApp internal async state updates
// - jsdom navigation warnings (expected when testing redirects)
/* eslint-disable no-console */
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const suppressedPatterns = [
  /\[DEPRECATED\].*zustand/i,
  /not wrapped in act\(/i,
  /Not implemented: navigation/i,
];

console.error = (...args: Parameters<typeof console.error>) => {
  const message = args[0]?.toString() ?? "";
  if (suppressedPatterns.some((pattern) => pattern.test(message))) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args: Parameters<typeof console.warn>) => {
  const message = args[0]?.toString() ?? "";
  if (suppressedPatterns.some((pattern) => pattern.test(message))) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
/* eslint-enable no-console */
