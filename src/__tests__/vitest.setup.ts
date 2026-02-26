// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Patch CSSStyleSheet.prototype.insertRule to handle @stitches/react CSS rules
// that jsdom cannot parse (e.g., '--sxs{--sxs:6}')
const originalInsertRule = CSSStyleSheet.prototype.insertRule;
CSSStyleSheet.prototype.insertRule = function (
  rule: string,
  index?: number,
): number {
  try {
    return originalInsertRule.call(this, rule, index);
  } catch {
    // Return 0 for rules that jsdom cannot parse (like stitches internal rules)
    return 0;
  }
};

// Suppress known console warnings/errors from test dependencies
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const suppressedPatterns = [
  /zustand.*devtools/i,
  /act\(\.\.\.\)/i,
  /not wrapped in act/i,
  /ReactDOMTestUtils\.act/i,
  /Could not parse CSS stylesheet/i,
];

console.error = (...args: unknown[]) => {
  const message = args[0]?.toString() ?? "";
  if (suppressedPatterns.some((pattern) => pattern.test(message))) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args: unknown[]) => {
  const message = args[0]?.toString() ?? "";
  if (suppressedPatterns.some((pattern) => pattern.test(message))) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Mock TldrawApp class for tests
class MockTldrawApp {
  document = { name: "", assets: {} };
  settings = { isDarkMode: false, isFocusMode: false };
  room: { userId?: string; users: Record<string, unknown> } | null = null;
  assets: Array<{ id: string }> = [];
  fileSystemHandle: unknown = null;
  readOnly = false;
  callbacks: { onAssetCreate?: unknown } = {};
  disableAssets = false;
  centerPoint = [0, 0];
  viewport = {
    minX: 0,
    minY: 0,
    maxX: 100,
    maxY: 100,
    width: 100,
    height: 100,
  };
  zoom = 1;

  loadRoom = vi.fn().mockImplementation(() => {
    this.room = { userId: "testUserId", users: {} };
    return this;
  });
  pause = vi.fn().mockReturnThis();
  setIsLoading = vi.fn().mockReturnThis();
  replacePageContent = vi.fn().mockReturnThis();
  patchState = vi.fn().mockReturnThis();
  patchAssets = vi
    .fn()
    .mockImplementation((assets: Record<string, unknown>) => {
      this.assets = Object.values(assets) as Array<{ id: string }>;
      return this;
    });
  createShapes = vi.fn().mockReturnThis();
  zoomToSelection = vi.fn().mockReturnThis();
  zoomToContent = vi.fn().mockReturnThis();
  zoomToFit = vi.fn().mockReturnThis();
  resetZoom = vi.fn().mockReturnThis();
  removeUser = vi.fn().mockReturnThis();
  updateUsers = vi.fn().mockReturnThis();
  getPagePoint = vi.fn().mockReturnValue([0, 0]);
  getImageOrVideoShapeAtPoint = vi.fn().mockReturnValue({});
  addMediaFromFiles = vi.fn();
  saveProjectAs = vi.fn();
  openAsset = vi.fn();
  openProject = vi.fn();
}

// Global mocks for @tldraw packages
vi.mock("@tldraw/tldraw", () => {
  // Define mock types as simple interfaces/type markers
  type MockTDAsset = { id: string; type?: string; src?: string };
  type MockTDBinding = { id: string };
  type MockTDShape = { id: string; assetId?: string };
  type MockTDUser = {
    id: string;
    activeShapes: unknown[];
    color: string;
    metadata: unknown;
    point: number[];
    selectedIds: string[];
    status: string;
  };

  // Return an empty type marker that can be used as a type in tests
  const createTypeMarker = () => ({});

  return {
    TDUserStatus: {
      Idle: "idle",
      Connecting: "connecting",
      Connected: "connected",
    },
    TDShapeType: {
      Image: "image",
      Video: "video",
    },
    TDAssetType: {
      Image: "image",
      Video: "video",
    },
    TldrawApp: MockTldrawApp,
    TLDR: {
      getBounds: () => ({ width: 100, height: 100 }),
    },
    useFileSystem: () => ({
      onOpenProject: () => {},
      onNewProject: () => {},
      onOpenMedia: () => {},
      onSaveProject: () => {},
      onSaveProjectAs: () => {},
    }),
    // Exported type markers (unused at runtime, but TypeScript needs them)
    TDAsset: createTypeMarker as unknown as MockTDAsset,
    TDBinding: createTypeMarker as unknown as MockTDBinding,
    TDShape: createTypeMarker as unknown as MockTDShape,
    TDUser: createTypeMarker as unknown as MockTDUser,
  };
});

vi.mock("@tldraw/core", () => ({
  Utils: {
    uniqueId: () => "mock-unique-id",
    getCommonBounds: () => ({ minX: 0, minY: 0, maxX: 100, maxY: 100 }),
    boundsContain: () => true,
  },
}));

vi.mock("@tldraw/vec", () => ({
  Vec: {
    isEqual: () => false,
    add: (a: number[], b: number[]) => [a[0] + b[0], a[1] + b[1]],
  },
}));
