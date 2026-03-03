import { vi } from "vitest";

// ============ Enums ============

export enum TDShapeType {
  Sticky = "sticky",
  Ellipse = "ellipse",
  Rectangle = "rectangle",
  Triangle = "triangle",
  Draw = "draw",
  Arrow = "arrow",
  Line = "line",
  Text = "text",
  Group = "group",
  Image = "image",
  Video = "video",
}

export enum TDAssetType {
  Image = "image",
  Video = "video",
}

export enum TDUserStatus {
  Idle = "idle",
  Connecting = "connecting",
  Connected = "connected",
  Disconnected = "disconnected",
}

export enum TDExportType {
  PNG = "png",
  JPG = "jpg",
  WEBP = "webp",
  SVG = "svg",
  JSON = "json",
}

// ============ Types/Interfaces ============

export interface TDAsset {
  id: string;
  type: TDAssetType;
  name: string;
  src: string;
  size: number[];
}

export interface TDBinding {
  id: string;
  fromId: string;
  toId: string;
  handleId: string;
  distance: number;
  point: number[];
  meta: Record<string, unknown>;
}

export interface TDShape {
  id: string;
  type: TDShapeType;
  parentId: string;
  childIndex: number;
  name: string;
  point: number[];
  assetId?: string;
  size?: number[];
  rotation?: number;
  children?: string[];
  handles?: Record<string, unknown>;
  isLocked?: boolean;
  isHidden?: boolean;
  isEditing?: boolean;
  isGenerated?: boolean;
  isAspectRatioLocked?: boolean;
  style?: Record<string, unknown>;
  label?: string;
  labelPoint?: number[];
}

export interface TDUser {
  id: string;
  color: string;
  point: number[];
  selectedIds: string[];
  activeShapes: TDShape[];
  status: TDUserStatus;
  metadata?: {
    id?: string;
    displayName?: string;
    initials?: string;
  };
}

export interface TDExport {
  type: TDExportType;
  name?: string;
}

export interface TDPage {
  id: string;
  name: string;
  shapes: Record<string, TDShape>;
  bindings: Record<string, TDBinding>;
}

export interface TDDocument {
  id: string;
  name: string;
  version: number;
  pages: Record<string, TDPage>;
  pageStates: Record<string, unknown>;
  assets: Record<string, TDAsset>;
}

export interface TDSettings {
  isDarkMode: boolean;
  isFocusMode: boolean;
  isSnapping: boolean;
  keepStyleMenuOpen: boolean;
  nudgeDistanceSmall: number;
  nudgeDistanceLarge: number;
}

export interface TldrawPatch {
  document?: Partial<TDDocument>;
  settings?: Partial<TDSettings>;
  [key: string]: unknown;
}

export interface TDCallbacks {
  onMount?: (app: TldrawApp) => void;
  onPatch?: (app: TldrawApp, patch: TldrawPatch, reason?: string) => void;
  onCommand?: (app: TldrawApp, command: unknown, reason?: string) => void;
  onPersist?: (app: TldrawApp) => void;
  onChangePage?: (
    app: TldrawApp,
    shapes: Record<string, TDShape | undefined>,
    bindings: Record<string, TDBinding | undefined>,
    assets: Record<string, TDAsset | undefined>,
  ) => void;
  onUndo?: (app: TldrawApp) => void;
  onRedo?: (app: TldrawApp) => void;
  onChangePresence?: (app: TldrawApp, user: TDUser) => void;
  onAssetCreate?: (
    app: TldrawApp,
    file: File,
    id: string,
  ) => Promise<string | false>;
  onAssetDelete?: (app: TldrawApp, id: string) => Promise<void>;
  onExport?: (app: TldrawApp, info: TDExport) => Promise<void>;
}

// ============ TLDR Static Methods ============

export const TLDR = {
  getBounds: vi.fn().mockReturnValue({
    minX: 0,
    minY: 0,
    maxX: 100,
    maxY: 100,
    width: 100,
    height: 100,
  }),
  getShapeUtil: vi.fn(),
  getSelectedShapes: vi.fn().mockReturnValue([]),
  getShape: vi.fn(),
  getPage: vi.fn(),
  getPageState: vi.fn(),
  getBindings: vi.fn().mockReturnValue({}),
  getSelectedIds: vi.fn().mockReturnValue([]),
  getShapes: vi.fn().mockReturnValue([]),
  getAssets: vi.fn().mockReturnValue([]),
  getBinding: vi.fn(),
  getAsset: vi.fn(),
  mutateShapes: vi.fn(),
  createShape: vi.fn(),
  deleteShape: vi.fn(),
  updateShape: vi.fn(),
  createBinding: vi.fn(),
  deleteBinding: vi.fn(),
  createAsset: vi.fn(),
  deleteAsset: vi.fn(),
  getShapeTree: vi.fn().mockReturnValue([]),
  getAllParents: vi.fn().mockReturnValue([]),
  getAllChildren: vi.fn().mockReturnValue([]),
  getAllDescendants: vi.fn().mockReturnValue([]),
  getAllAncestors: vi.fn().mockReturnValue([]),
  getCommonBounds: vi.fn().mockReturnValue({
    minX: 0,
    minY: 0,
    maxX: 100,
    maxY: 100,
    width: 100,
    height: 100,
  }),
  getRotatedBounds: vi.fn(),
  getTransformedBounds: vi.fn(),
  getShapeBounds: vi.fn(),
};

// ============ TldrawApp Class ============

export class TldrawApp {
  document: TDDocument = {
    id: "doc",
    name: "New Document",
    version: 0,
    pages: {
      page: {
        id: "page",
        name: "Page 1",
        shapes: {},
        bindings: {},
      },
    },
    pageStates: {},
    assets: {},
  };

  settings: TDSettings = {
    isDarkMode: false,
    isFocusMode: false,
    isSnapping: false,
    keepStyleMenuOpen: false,
    nudgeDistanceSmall: 1,
    nudgeDistanceLarge: 10,
  };

  room: {
    id: string;
    oderId: string;
    userId: string;
    users: Record<string, TDUser>;
  } | null = null;

  callbacks: TDCallbacks = {};
  fileSystemHandle: FileSystemFileHandle | null = null;
  readOnly: boolean = false;
  disableAssets: boolean = false;

  get centerPoint(): number[] {
    return [0, 0];
  }

  get viewport() {
    return {
      minX: 0,
      minY: 0,
      maxX: 1000,
      maxY: 1000,
      width: 1000,
      height: 1000,
    };
  }

  get zoom(): number {
    return 1;
  }

  get assets(): TDAsset[] {
    return Object.values(this.document.assets);
  }

  loadRoom = vi.fn().mockImplementation((roomId: string) => {
    this.room = {
      id: roomId,
      oderId: roomId,
      userId: "test-user-id",
      users: {},
    };
    return this;
  });

  pause = vi.fn().mockReturnThis();
  resume = vi.fn().mockReturnThis();
  undo = vi.fn().mockReturnThis();
  redo = vi.fn().mockReturnThis();
  selectAll = vi.fn().mockReturnThis();
  selectNone = vi.fn().mockReturnThis();
  delete = vi.fn().mockReturnThis();
  copy = vi.fn().mockReturnThis();
  paste = vi.fn().mockReturnThis();
  cut = vi.fn().mockReturnThis();
  zoomIn = vi.fn().mockReturnThis();
  zoomOut = vi.fn().mockReturnThis();
  zoomToFit = vi.fn().mockReturnThis();
  zoomToSelection = vi.fn().mockReturnThis();
  zoomToContent = vi.fn().mockReturnThis();
  resetZoom = vi.fn().mockReturnThis();
  setIsLoading = vi.fn().mockReturnThis();

  replacePageContent = vi
    .fn()
    .mockImplementation(
      (
        shapes: Record<string, TDShape>,
        bindings: Record<string, TDBinding>,
        assets: Record<string, TDAsset>,
      ) => {
        if (this.document.pages.page) {
          this.document.pages.page.shapes = shapes;
          this.document.pages.page.bindings = bindings;
        }
        this.document.assets = assets;
        return this;
      },
    );

  patchState = vi.fn().mockImplementation((patch: Partial<TldrawPatch>) => {
    if (patch.document?.assets) {
      this.document.assets = {
        ...this.document.assets,
        ...patch.document.assets,
      };
    }
    return this;
  });

  patchAssets = vi
    .fn()
    .mockImplementation((assets: Record<string, TDAsset>) => {
      this.document.assets = { ...this.document.assets, ...assets };
      return this;
    });

  createShapes = vi.fn().mockReturnThis();
  updateShapes = vi.fn().mockReturnThis();
  deleteShapes = vi.fn().mockReturnThis();
  createBindings = vi.fn().mockReturnThis();
  deleteBindings = vi.fn().mockReturnThis();
  createAssets = vi.fn().mockReturnThis();
  deleteAssets = vi.fn().mockReturnThis();

  updateUsers = vi.fn().mockReturnThis();
  removeUser = vi.fn().mockReturnThis();

  getPagePoint = vi.fn().mockImplementation((point: number[]) => point);
  getImageOrVideoShapeAtPoint = vi
    .fn()
    .mockImplementation(
      (
        id: string,
        type: TDShapeType,
        point: number[],
        size: number[],
        assetId: string,
      ) => ({
        id,
        type,
        parentId: "page",
        childIndex: 1,
        name: "shape",
        point,
        size,
        assetId,
      }),
    );

  saveProjectAs = vi.fn().mockResolvedValue(undefined);
  openAsset = vi.fn().mockResolvedValue(undefined);
  openProject = vi.fn().mockResolvedValue(undefined);

  addMediaFromFiles = vi.fn().mockResolvedValue(undefined);
}

// ============ Hooks ============

export const useFileSystem = vi.fn().mockReturnValue({
  onNewProject: vi.fn(),
  onOpenProject: vi.fn(),
  onOpenMedia: vi.fn(),
  onSaveProject: vi.fn(),
  onSaveProjectAs: vi.fn(),
});

export const useTldrawApp = vi.fn().mockReturnValue(new TldrawApp());

// ============ Components ============

export const Tldraw = vi.fn().mockImplementation(({ children }) => children);

// ============ Default Export ============

export default {
  TDShapeType,
  TDAssetType,
  TDUserStatus,
  TDExportType,
  TLDR,
  TldrawApp,
  useFileSystem,
  useTldrawApp,
  Tldraw,
};
