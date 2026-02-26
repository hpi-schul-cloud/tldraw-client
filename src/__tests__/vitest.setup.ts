// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Fix for @stitches/react CSS parsing errors in jsdom
// Stitches uses CSS custom properties that jsdom's CSSOM can't parse (e.g., '--sxs{--sxs:6}')
// We need to patch insertRule to handle these and ensure cssRules stays in sync
const originalInsertRule = CSSStyleSheet.prototype.insertRule;
CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
  try {
    return originalInsertRule.call(this, rule, index);
  } catch (e) {
    // For stitches-specific rules that jsdom can't parse, create a minimal mock rule
    if (rule.startsWith("--sxs")) {
      const idx = index ?? this.cssRules.length;
      // Create a fake CSSRule-like object
      const fakeRule = {
        cssText: rule,
        parentStyleSheet: this,
        type: 1, // CSSRule.STYLE_RULE
      };
      // Insert into cssRules array (which is a CSSRuleList-like object)
      const rules = Array.from(this.cssRules);
      rules.splice(idx, 0, fakeRule as unknown as CSSRule);
      // Update the internal rules - this is a workaround since cssRules is readonly
      Object.defineProperty(this, "cssRules", {
        value: rules,
        writable: true,
        configurable: true,
      });
      return idx;
    }
    throw e;
  }
};

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

