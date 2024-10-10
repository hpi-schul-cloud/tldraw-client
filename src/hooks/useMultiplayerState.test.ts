import { renderHook, act } from "@testing-library/react";
import {
  TDAsset,
  TDBinding,
  TDShape,
  TDUser,
  TldrawApp,
  TDUserStatus,
} from "@tldraw/tldraw";
import * as Tldraw from "@tldraw/tldraw";
import { useMultiplayerState } from "./useMultiplayerState";
import { doc, room, undoManager } from "../stores/setup";
import { deleteAsset, handleAssets } from "../utils/handleAssets";

vi.mock("@tldraw/tldraw", async () => {
  const tldraw = await vi.importActual("@tldraw/tldraw");

  return {
    ...tldraw,
  };
});

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
  },
  envs: {
    TLDRAW__ASSETS_ENABLED: true,
    TLDRAW__ASSETS_MAX_SIZE: 1000000,
    TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST: ["image/png", "image/jpeg"],
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

    const useFileSystemSpy = vi.spyOn(Tldraw, "useFileSystem").mockReturnValue({
      onOpenProject: mockOpenProject,
      onNewProject: vi.fn(),
      onOpenMedia: vi.fn(),
      onSaveProject: vi.fn(),
      onSaveProjectAs: vi.fn(),
    });

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
      useFileSystemSpy,
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
