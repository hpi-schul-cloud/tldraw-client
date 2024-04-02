import lodash from "lodash";
import React from "react";
import {
  TDAsset,
  TDBinding,
  TDExport,
  TDShape,
  TDUser,
  TldrawApp,
  TldrawPatch,
} from "@tldraw/tldraw";
import { Utils, TDShapeType } from "@tldraw/core";
import { User } from "@y-presence/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  doc,
  room,
  provider,
  undoManager,
  yAssets,
  yBindings,
  yShapes,
  user,
  envs,
} from "../stores/setup";
import { STORAGE_SETTINGS_KEY } from "../utils/userSettings";
import { UserPresence } from "../types/UserPresence";
import { fileMimeExtensions } from "../types/fileExtensions";
import {
  importAssetsToS3,
  openFromFileSystem,
  openAssetsFromFileSystem,
  addMediaFromFiles,
} from "../utils/boardImportUtils";
import { saveToFileSystem } from "../utils/boardExportUtils";
import { uploadFileToStorage } from "../utils/fileUpload";
import { getImageBlob } from "../utils/tldrawImageExportUtils";

declare const window: Window & { app: TldrawApp };

interface MultiplayerStateProps {
  roomId: string;
  setIsDarkMode: (isDarkMode: boolean) => void;
  setIsFocusMode: (isFocusMode: boolean) => void;
}

export function useMultiplayerState({
  roomId,
  setIsDarkMode,
  setIsFocusMode,
}: MultiplayerStateProps) {
  const [app, setApp] = useState<TldrawApp>();
  const [loading, setLoading] = useState(true);

  // Callbacks --------------

  const onSave = useCallback(async (app: TldrawApp) => {
    app.setIsLoading(true);
    undoManager.stopCapturing();
    syncAssets(app);
    try {
      const copiedDocument = lodash.cloneDeep(app.document);
      const handle = await saveToFileSystem(
        copiedDocument,
        app.fileSystemHandle,
        app.document.name,
      );

      if (handle) {
        app.fileSystemHandle = handle;
      }
    } catch (error) {
      handleError("An error occurred while exporting project", error);
    }
    app.setIsLoading(false);
  }, []);

  const onSaveAs = useCallback(async (app: TldrawApp, fileName?: string) => {
    app.setIsLoading(true);
    undoManager.stopCapturing();
    syncAssets(app);
    try {
      const copiedDocument = lodash.cloneDeep(app.document);
      const handle = await saveToFileSystem(
        copiedDocument,
        null,
        fileName ?? app.document.name,
      );

      if (handle) {
        app.fileSystemHandle = handle;
      }
    } catch (error) {
      handleError("An error occurred while exporting project", error);
    }
    app.setIsLoading(false);
  }, []);

  const onMount = useCallback(
    (app: TldrawApp) => {
      app.loadRoom(roomId);
      app.document.name = `board-${roomId}`;
      // Turn off the app's own undo / redo stack
      app.pause();
      // Put the state into the window, for debugging
      window.app = app;
      setApp(app);

      // below functions are overwriting the original tldraw implementations
      // some of them had to be changed/fixed to support additional functionality
      app.saveProjectAs = async (filename) => {
        await onSaveAs(app, filename);
        return app;
      };

      app.openAsset = async () => {
        if (app.disableAssets) return;

        try {
          const files = await openAssetsFromFileSystem();

          if (!files) return;

          const filesToAdd = Array.isArray(files) ? files : [files];
          addMediaFromFiles(filesToAdd, app.centerPoint);
        } catch (error) {
          handleError("An error occurred while uploading asset", error);
        }
      };

      app.openProject = async () => {
        try {
          app.setIsLoading(true);
          const result = await openFromFileSystem();

          if (!result) {
            throw new Error("Could not open file");
          }

          const { document, fileHandle } = result;
          await importAssetsToS3(document, roomId, user!.schoolId);

          yShapes.clear();
          yBindings.clear();
          yAssets.clear();
          undoManager.clear();
          updateDoc(
            document.pages.page.shapes,
            document.pages.page.bindings,
            document.assets,
          );

          app.fileSystemHandle = fileHandle;
          app.zoomToContent();
          app.zoomToFit();
        } catch (error) {
          handleError("An error occurred while opening project", error);
        }
        app.setIsLoading(false);
      };
    },
    [onSaveAs, roomId],
  );

  const onAssetCreate = useCallback(
    async (
      _app: TldrawApp,
      file: File,
      id: string,
    ): Promise<string | false> => {
      if (!envs!.TLDRAW__ASSETS_ENABLED) {
        toast.info("Asset uploading is disabled");
        return false;
      }

      if (file.size > envs!.TLDRAW__ASSETS_MAX_SIZE) {
        const bytesInMb = 1048576;
        const sizeInMb = envs!.TLDRAW__ASSETS_MAX_SIZE / bytesInMb;
        toast.info(`Asset is too big - max. ${sizeInMb}MB`);
        return false;
      }

      const isMimeTypeDisallowed =
        envs!.TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST &&
        !envs!.TLDRAW__ASSETS_ALLOWED_MIME_TYPES_LIST.includes(file.type);

      if (isMimeTypeDisallowed) {
        toast.info("Asset of this type is not allowed");
        return false;
      }

      undoManager.stopCapturing();

      try {
        const fileExtension = file.name.split(".").pop()!;
        const url = await uploadFileToStorage(
          file,
          fileExtension,
          id,
          user!.schoolId,
          roomId,
        );

        return url;
      } catch (error) {
        handleError("An error occurred while uploading asset", error);
      }

      return false;
    },
    [roomId],
  );

  const onPatch = useCallback(
    (app: TldrawApp, _patch: TldrawPatch, reason: string | undefined) => {
      if (reason?.includes("settings")) {
        localStorage.setItem(
          STORAGE_SETTINGS_KEY,
          JSON.stringify(app.settings),
        );

        setIsDarkMode(app.settings.isDarkMode);
        setIsFocusMode(app.settings.isFocusMode);
      }
    },
    [setIsDarkMode, setIsFocusMode],
  );

  const onUndo = useCallback(() => {
    undoManager.undo();
  }, []);

  const onRedo = useCallback(() => {
    undoManager.redo();
  }, []);

  // Update the yjs doc shapes when the app's shapes change
  const onChangePage = useCallback(
    (
      _app: TldrawApp,
      shapes: Record<string, TDShape | undefined>,
      bindings: Record<string, TDBinding | undefined>,
      assets: Record<string, TDAsset | undefined>,
    ) => {
      if (!(yShapes && yBindings && yAssets)) return;

      undoManager.stopCapturing();
      updateDoc(shapes, bindings, assets);
    },
    [],
  );

  // Handle presence updates when the user's pointer / selection changes
  const onChangePresence = useCallback((app: TldrawApp, tdUser: TDUser) => {
    if (!app.room) return;
    tdUser.metadata = {
      id: user!.id,
      displayName: `${user!.firstName} ${user!.lastName}`,
      initials: user!.initials,
    };
    room.updatePresence({ tdUser });
  }, []);

  const onExport = useCallback(
    async (app: TldrawApp, info: TDExport) => {
      app.setIsLoading(true);
      undoManager.stopCapturing();
      syncAssets(app);
      try {
        const blob = await getImageBlob(app, info.type);

        if (!blob) {
          app.setIsLoading(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${roomId}_export.${info.type}`;
        link.click();
      } catch (error) {
        handleError("An error occurred while exporting to image", error);
      }
      app.setIsLoading(false);
    },
    [roomId],
  );

  // Document Changes --------

  // Update app users whenever there is a change in the room users
  useEffect(() => {
    if (!app || !room) return;

    const handleUsersChange = (users: User<UserPresence>[]) => {
      if (!app.room) return;

      const ids = users
        .filter((user) => user.presence && user.presence.tdUser)
        .map((user) => user.presence!.tdUser!.id);

      // Remove any user that is not connected in the room
      Object.values(app.room.users).forEach((user) => {
        if (user && !ids.includes(user.id) && user.id !== app.room?.userId) {
          app.removeUser(user.id);
        }
      });

      app.updateUsers(
        users
          .filter((user) => user.presence && user.presence.tdUser)
          .map((other) => other.presence!.tdUser!)
          .filter(Boolean),
      );
    };

    room.subscribe("others", handleUsersChange);

    return () => {
      room.unsubscribe("others", handleUsersChange);
    };
  }, [app]);

  // Update the app's shapes when the yjs doc's shapes change
  useEffect(() => {
    const handleChanges = () => {
      if (!app) return;

      app.replacePageContent(
        Object.fromEntries(yShapes.entries()),
        Object.fromEntries(yBindings.entries()),
        Object.fromEntries(yAssets.entries()),
      );
    };

    const setup = () => {
      yShapes.observeDeep(handleChanges);
      handleChanges();

      if (app) {
        // Hacky, but without small delay
        // zoom function does not work
        // despite tldraw state being loaded
        setTimeout(() => {
          app.zoomToContent();
          app.zoomToFit();
          if (app.zoom > 1) {
            app.resetZoom();
          }
        }, 200);
      }
      setLoading(false);
    };

    setup();

    return () => {
      yShapes.unobserveDeep(handleChanges);
    };
  }, [app]);

  useEffect(() => {
    const handleDisconnect = () => {
      provider.disconnect();
    };

    window.addEventListener("beforeunload", handleDisconnect);

    return () => {
      window.removeEventListener("beforeunload", handleDisconnect);
    };
  }, []);

  return {
    onUndo,
    onRedo,
    onMount,
    onSave,
    onSaveAs,
    onExport,
    onChangePage,
    onChangePresence,
    loading,
    onPatch,
    onAssetCreate,
    onDrop,
  };
}

const updateDoc = (
  shapes: Record<string, TDShape | undefined>,
  bindings: Record<string, TDBinding | undefined>,
  assets: Record<string, TDAsset | undefined>,
) => {
  doc.transact(() => {
    Object.entries(shapes).forEach(([id, shape]) => {
      if (!shape) {
        yShapes.delete(id);
      } else {
        yShapes.set(shape.id, shape);
      }
    });

    Object.entries(bindings).forEach(([id, binding]) => {
      if (!binding) {
        yBindings.delete(id);
      } else {
        yBindings.set(binding.id, binding);
      }
    });

    Object.entries(assets).forEach(([id, asset]) => {
      if (!asset) {
        yAssets.delete(id);
      } else {
        yAssets.set(asset.id, asset);
      }
    });
  });
};

const syncAssets = (app: TldrawApp) => {
  const usedShapesAsAssets: TDShape[] = [];

  yShapes.forEach((shape) => {
    if (shape.assetId) {
      usedShapesAsAssets.push(shape);
    }
  });

  doc.transact(() => {
    yAssets.forEach((asset) => {
      const foundAsset = usedShapesAsAssets.find(
        (shape) => shape.assetId === asset.id,
      );

      if (!foundAsset) {
        yAssets.delete(asset.id);
      }
    });
  });

  app.replacePageContent(
    Object.fromEntries(yShapes.entries()),
    Object.fromEntries(yBindings.entries()),
    Object.fromEntries(yAssets.entries()),
  );
};

const handleError = (toastMessage: string, error: unknown) => {
  if (error instanceof Error) {
    if (error.message === "The user aborted a request.") {
      // a case when user cancels some action, like opening project
      // should not really be treated as an error
      return;
    }

    console.error(toastMessage, error);
    toast.error(toastMessage);
  }
};

const onDrop = async (e: React.DragEvent<HTMLDivElement>, app: TldrawApp) => {
  e.preventDefault();

  if (app.disableAssets) return app;

  const dataTransfer = e.dataTransfer;
  if (!dataTransfer) return app;

  const files = dataTransfer.files;
  if (!files) return app;

  try {
    await handleDroppedFiles(files, app);
  } catch (error) {
    handleError("An error occurred while handling dropped files", error);
  }

  return app;
};

const handleDroppedFiles = async (files: FileList, app: TldrawApp) => {
  const mimeTypes = Object.keys(fileMimeExtensions);

  for (const file of Array.from(files)) {
    const id = Utils.uniqueId();
    const extension = file.name.match(/\.[0-9a-z]+$/i);

    if (!extension) throw Error("No extension");

    const fileMimeType = mimeTypes.find((mimeType) =>
      file.type.startsWith(mimeType),
    );

    if (!fileMimeType) {
      app.setIsLoading(false);
      toast.error("Wrong file format");
      continue;
    }

    const allowedExtensions = fileMimeExtensions[fileMimeType];
    const isAllowedExtension = allowedExtensions.some(
      (ext) => ext === extension[0].toLowerCase(),
    );

    if (!isAllowedExtension) {
      app.setIsLoading(false);
      toast.error("Wrong file format");
      continue;
    }
  }
};

const addMediaFromFiles = async (files: File[], point = app.centerPoint) => {
  app.setIsLoading(false);

  const shapesToCreate: TDShape[] = [];
  const pagePoint = app.getPagePoint(point);

  for (const file of files) {
    const id = Utils.uniqueId();
    const extension = file.name.match(/\.[0-9a-z]+$/i);

    if (!extension) throw Error("No extension");

    const mimeTypes = Object.keys(fileMimeExtensions);
    const fileMimeType = mimeTypes.find((mimeType) =>
      file.type.startsWith(mimeType),
    );

    if (!fileMimeType) {
      app.setIsLoading(true);
      toast.error("Wrong file format");
      continue;
    }

    const allowedExtensions = fileMimeExtensions[fileMimeType];
    const isImage = allowedExtensions.some(
      (ext) => ext === extension[0].toLowerCase(),
    );

    if (!isImage) {
      app.setIsLoading(true);
      toast.error("Wrong file format");
      continue;
    }

    let src: string | ArrayBuffer | null;

    try {
      if (app.callbacks.onAssetCreate) {
        const result = await app.callbacks.onAssetCreate(app, file, id);

        if (!result) throw Error("Asset creation callback returned false");

        src = result;
      } else {
        src = await fileToBase64(file);
      }

      if (typeof src === "string") {
        let size = [0, 0];

        if (isImage) {
          if (extension[0] == ".svg") {
            let viewBox: string[];
            const svgString = await fileToText(file);
            const viewBoxAttribute = app.getViewboxFromSVG(svgString);

            if (viewBoxAttribute) {
              viewBox = viewBoxAttribute.split(" ");
              size[0] = parseFloat(viewBox[2]);
              size[1] = parseFloat(viewBox[3]);
            }
          }
          if (Vec.isEqual(size, [0, 0])) {
            size = await getImageSizeFromSrc(src);
          }
        } else {
          size = await getVideoSizeFromSrc(src);
        }

        const match = Object.values(app.document.assets).find(
          (asset) => asset.type === assetType && asset.src === src,
        );

        let assetId: string;

        if (!match) {
          assetId = id;

          const asset = {
            id: assetId,
            type: assetType,
            name: file.name,
            src,
            size,
          };

          app.patchState({
            document: {
              assets: {
                [assetId]: asset,
              },
            },
          });
        } else {
          assetId = match.id;
        }

        shapesToCreate.push(
          app.getImageOrVideoShapeAtPoint(id, point, size, assetId),
        );
      }
    } catch (error) {
      // Even if one shape errors, keep going (we might have had other shapes that didn't error)
    }
  }

  if (shapesToCreate.length) {
    const currentPoint = Vec.add(pagePoint, [0, 0]);

    shapesToCreate.forEach((shape, i) => {
      const bounds = TLDR.getBounds(shape);

      if (i === 0) {
        currentPoint[0] -= bounds.width / 2;
        currentPoint[1] -= bounds.height / 2;
      }

      shape.point = [...currentPoint];

      currentPoint[0] += bounds.width;
    });

    const commonBounds = Utils.getCommonBounds(
      shapesToCreate.map(TLDR.getBounds),
    );

    app.createShapes(...shapesToCreate);

    if (!Utils.boundsContain(app.viewport, commonBounds)) {
      app.zoomToSelection();
      if (app.zoom > 1) {
        app.resetZoom();
      }
    }
  }

  app.setIsLoading(false);
  return app;
};
