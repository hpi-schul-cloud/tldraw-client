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
    TLDRAW__ASSETS_ALLOWED_EXTENSIONS_LIST: [".png", ".jpg"],
  },
}));

vi.mock("../utils/userSettings", () => ({
  setDefaultState: vi.fn(),
  STORAGE_SETTINGS_KEY: "settingsKey",
}));

vi.mock("@y-presence/client", () => ({
  User: vi.fn(),
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
      mockOpenProject,
    };
  };

  it("should handle onMount correctly", () => {
    const { app, loadRoomSpy, pauseSpy } = setup();
    const { result } = renderHook(() =>
      useMultiplayerState("testRoom", () => {}),
    );

    act(() => {
      result.current.onMount(app);
    });

    expect(loadRoomSpy).toHaveBeenCalledWith("testRoom");
    expect(pauseSpy).toHaveBeenCalled();
  });

  it("should handle onUndo correctly", () => {
    const { result } = renderHook(() =>
      useMultiplayerState("testRoom", () => {}),
    );

    act(() => {
      result.current.onUndo();
    });

    expect(undoManager.undo).toHaveBeenCalled();
  });

  it("should handle onRedo correctly", () => {
    const { result } = renderHook(() =>
      useMultiplayerState("testRoom", () => {}),
    );

    act(() => {
      result.current.onRedo();
    });

    expect(undoManager.redo).toHaveBeenCalled();
  });

  it("should handle onChangePage correctly", () => {
    const { app } = setup();
    const { result } = renderHook(() =>
      useMultiplayerState("testRoom", () => {}),
    );
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
    const { result } = renderHook(() =>
      useMultiplayerState("testRoom", () => {}),
    );

    act(() => {
      app.loadRoom("testRoom");
      result.current.onChangePresence(app, user);
    });

    expect(room.updatePresence).toHaveBeenCalledWith({
      tdUser: user,
    });
  });

  it("should handle onOpen correctly", () => {
    const { app, mockOpenDialog, mockOpenProject } = setup();
    const { result } = renderHook(() =>
      useMultiplayerState("testRoom", () => {}),
    );

    act(() => {
      result.current.onOpen(app, mockOpenDialog);
    });

    expect(mockOpenProject).toHaveBeenCalled();
    expect(app.openProject).toBeDefined();
  });
});
