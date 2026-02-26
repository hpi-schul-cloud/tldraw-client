import { beforeEach, describe, expect, it, vi } from "vitest";

// Note: @tldraw/tldraw, @tldraw/core, @tldraw/vec are mocked in vitest.setup.ts

vi.mock("browser-fs-access", () => ({
  fileOpen: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../stores/setup", () => ({
  doc: {
    transact: vi.fn(),
  },
  room: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    updatePresence: vi.fn(),
    users: {},
  },
  provider: {
    disconnect: vi.fn(),
  },
  pauseSync: vi.fn(),
  resumeSync: vi.fn(),
  undoManager: {
    stopCapturing: vi.fn(),
    clear: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
  },
  yAssets: {
    entries: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  yBindings: {
    entries: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  yShapes: {
    entries: vi.fn(),
    set: vi.fn(),
    observeDeep: vi.fn(),
    unobserveDeep: vi.fn(),
    clear: vi.fn(),
  },
  user: {
    schoolId: "school123",
    id: "user123",
    firstName: "John",
    lastName: "Doe",
    initials: "JD",
  },
  envs: {
    TLDRAW_ASSETS_ENABLED: true,
    TLDRAW_ASSETS_MAX_SIZE_BYTES: 1000000,
    TLDRAW_ASSETS_ALLOWED_MIME_TYPES_LIST: ["image/png", "image/jpeg"],
  },
}));

vi.mock("../utils/userSettings", () => ({
  setDefaultState: vi.fn(),
  STORAGE_SETTINGS_KEY: "settingsKey",
}));

vi.mock("@y-presence/client", () => ({
  User: vi.fn(),
}));

vi.mock("../utils/handleAssets", () => ({
  deleteAsset: vi.fn(),
  handleAssets: vi.fn(),
}));

vi.mock("../utils/boardExportUtils", () => ({
  fileToBase64: vi.fn().mockResolvedValue("data:image/png;base64,mock"),
  fileToText: vi.fn().mockResolvedValue("<svg></svg>"),
  saveToFileSystem: vi.fn().mockResolvedValue(null),
}));

vi.mock("../utils/boardImportUtils", () => ({
  importAssetsToS3: vi.fn().mockResolvedValue(undefined),
  openFromFileSystem: vi.fn().mockResolvedValue(null),
}));

vi.mock("../utils/fileUpload", () => ({
  uploadFileToStorage: vi
    .fn()
    .mockResolvedValue("https://example.com/file.png"),
}));

vi.mock("../utils/tldrawFileUploadUtils", () => ({
  getImageSizeFromSrc: vi.fn().mockResolvedValue([100, 100]),
  getVideoSizeFromSrc: vi.fn().mockResolvedValue([100, 100]),
  getViewboxFromSVG: vi.fn().mockReturnValue("0 0 100 100"),
  IMAGE_EXTENSIONS: [".png", ".jpg", ".jpeg", ".gif", ".svg"],
  VIDEO_EXTENSIONS: [".mp4", ".webm"],
  openAssetsFromFileSystem: vi.fn().mockResolvedValue(null),
}));

vi.mock("../utils/tldrawImageExportUtils", () => ({
  getImageBlob: vi.fn().mockResolvedValue(new Blob()),
}));

vi.mock("lodash", () => ({
  default: {
    cloneDeep: <T>(obj: T): T => structuredClone(obj),
  },
}));

// Now import after mocks are defined
import { act, renderHook } from "@testing-library/react";
import {
  TDAsset,
  TDBinding,
  TDShape,
  TDUser,
  TDUserStatus,
  TldrawApp,
} from "@tldraw/tldraw";
import { doc, room, undoManager } from "../stores/setup";
import { deleteAsset, handleAssets } from "../utils/handleAssets";
import { useMultiplayerState } from "./useMultiplayerState";

Object.fromEntries = vi.fn();

describe("useMultiplayerState hook", () => {
  const setup = () => {
    const app = new TldrawApp();
    const replacePageContentSpy = vi
      .spyOn(app, "replacePageContent")
      .mockImplementation(() => {
        return app;
      });
    const loadRoomSpy = vi.spyOn(app, "loadRoom");
    const pauseSpy = vi.spyOn(app, "pause");
    const mockOpenDialog = vi.fn();
    const mockOpenProject = vi.fn();

    const setIsDarkMode = vi.fn();
    const setIsFocusMode = vi.fn();

    const user: TDUser = {
      activeShapes: [],
      color: "",
      metadata: undefined,
      point: [],
      selectedIds: [],
      id: "testId",
      status: TDUserStatus.Idle,
    };

    return {
      app,
      replacePageContentSpy,
      loadRoomSpy,
      pauseSpy,
      user,
      mockOpenDialog,
      setIsDarkMode,
      setIsFocusMode,
      mockOpenProject,
    };
  };

  const multiPlayerProps = {
    parentId: "testParent",
    setIsDarkMode: vi.fn(),
    setIsFocusMode: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should handle onMount correctly", () => {
    const { app, loadRoomSpy, pauseSpy } = setup();
    const { result } = renderHook(() => useMultiplayerState(multiPlayerProps));

    act(() => {
      result.current.onMount(app);
    });

    expect(loadRoomSpy).toHaveBeenCalledWith("testParent");
    expect(pauseSpy).toHaveBeenCalled();
  });

  it("should handle setIsDarkMode and setIsFocusMode correctly", () => {
    const { app, setIsDarkMode, setIsFocusMode } = setup();
    const { result } = renderHook(() =>
      useMultiplayerState({
        ...multiPlayerProps,
        setIsDarkMode,
        setIsFocusMode,
      }),
    );

    act(() => {
      result.current.onPatch(app, {}, "settings");

      expect(setIsDarkMode).toHaveBeenCalledWith(app.settings.isDarkMode);
      expect(setIsFocusMode).toHaveBeenCalledWith(app.settings.isFocusMode);
    });
  });

  describe("onUndo", () => {
    it("should call undoManager.undo", () => {
      const { app } = setup();
      const { result } = renderHook(() =>
        useMultiplayerState(multiPlayerProps),
      );
      const undoSpy = vi.spyOn(undoManager, "undo");

      act(() => {
        result.current.onUndo(app);
      });

      expect(undoSpy).toHaveBeenCalled();
    });

    it("should call handleAssets", () => {
      const { app } = setup();
      const { result } = renderHook(() =>
        useMultiplayerState(multiPlayerProps),
      );

      act(() => {
        result.current.onUndo(app);
      });

      expect(handleAssets).toHaveBeenCalled();
    });
  });

  describe("onRedo", () => {
    it("should call undoManager.redo", () => {
      const { app } = setup();
      const { result } = renderHook(() =>
        useMultiplayerState(multiPlayerProps),
      );
      const redoSpy = vi.spyOn(undoManager, "redo");

      act(() => {
        result.current.onRedo(app);
      });

      expect(redoSpy).toHaveBeenCalled();
    });

    it("should call handleAssets", () => {
      const { app } = setup();
      const { result } = renderHook(() =>
        useMultiplayerState(multiPlayerProps),
      );

      act(() => {
        result.current.onRedo(app);
      });

      expect(handleAssets).toHaveBeenCalled();
    });
  });

  it("should handle onChangePage correctly", () => {
    const { app } = setup();
    const { result } = renderHook(() => useMultiplayerState(multiPlayerProps));
    const shapes: Record<string, TDShape | undefined> = {
      shape1: undefined,
    };
    const bindings: Record<string, TDBinding | undefined> = {
      binding1: undefined,
    };
    const assets: Record<string, TDAsset | undefined> = {
      asset1: undefined,
    };

    act(() => {
      result.current.onChangePage(app, shapes, bindings, assets);
    });

    expect(doc.transact).toHaveBeenCalled();
  });

  it("should handle onChangePresence correctly", () => {
    const { app, user } = setup();
    const { result } = renderHook(() => useMultiplayerState(multiPlayerProps));

    act(() => {
      app.loadRoom("testParent");
      result.current.onChangePresence(app, user);
    });

    expect(room.updatePresence).toHaveBeenCalledWith({
      tdUser: user,
    });
  });

  describe("should handle onAssetDelete correctly", () => {
    describe("when asset exists", () => {
      it("should call deleteAsset", () => {
        const { app } = setup();
        const { result } = renderHook(() =>
          useMultiplayerState(multiPlayerProps),
        );
        const id = "asset1";
        const assets = { asset1: { id } as TDAsset };
        app.patchAssets(assets);

        act(() => {
          result.current.onAssetDelete(app, id);
        });

        expect(deleteAsset).toHaveBeenCalledWith(assets.asset1);
      });
    });

    describe("when asset does not exist", () => {
      it("should not call deleteAsset", () => {
        const { app } = setup();
        const { result } = renderHook(() =>
          useMultiplayerState(multiPlayerProps),
        );

        act(() => {
          result.current.onAssetDelete(app, "asset1");
        });

        expect(deleteAsset).not.toHaveBeenCalled();
      });
    });
  });
});
