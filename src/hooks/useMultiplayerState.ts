import { Utils } from "@tldraw/core";
import {
  TDAsset,
  TDAssetType,
  TDBinding,
  TDExport,
  TDShape,
  TDShapeType,
  TDUser,
  TLDR,
  TldrawApp,
  TldrawPatch,
} from "@tldraw/tldraw";
import { Vec } from "@tldraw/vec";
import { User } from "@y-presence/client";
import lodash from "lodash";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  doc,
  envs,
  pauseSync,
  provider,
  resumeSync,
  room,
  undoManager,
  user,
  yAssets,
  yBindings,
  yShapes,
} from "../stores/setup";
import { UserPresence } from "../types/UserPresence";
import {
  fileToBase64,
  fileToText,
  saveToFileSystem,
} from "../utils/boardExportUtils";
import {
  importAssetsToS3,
  openFromFileSystem,
} from "../utils/boardImportUtils";
import { uploadFileToStorage } from "../utils/fileUpload";
import { deleteAsset, handleAssets } from "../utils/handleAssets";
import {
  getImageSizeFromSrc,
  getVideoSizeFromSrc,
  getViewboxFromSVG,
  IMAGE_EXTENSIONS,
  openAssetsFromFileSystem,
  VIDEO_EXTENSIONS,
} from "../utils/tldrawFileUploadUtils";
import { getImageBlob } from "../utils/tldrawImageExportUtils";
import { STORAGE_SETTINGS_KEY } from "../utils/userSettings";

declare const window: Window & { app: TldrawApp };

interface MultiplayerStateProps {
  parentId: string;
  setIsDarkMode: (isDarkMode: boolean) => void;
  setIsFocusMode: (isFocusMode: boolean) => void;
}

export function useMultiplayerState({
  parentId,
  setIsDarkMode,
  setIsFocusMode,
}: MultiplayerStateProps) {
  const [app, setApp] = useState<TldrawApp>();
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const setIsReadOnlyToTrue = (app?: TldrawApp) => {
    setIsReadOnly(true);
    if (app) app.setIsLoading(true);
  };

  // Bug in tl draw package leads to situation where app context readonly and prop readonly are not in sync.
  // This function is a workaround to make sure that both are in sync.
  const setIsReadOnlyToFalse = (app?: TldrawApp) => {
    setIsReadOnly(false);
    if (app) {
      app.readOnly = false;
      app.setIsLoading(false);
    }
  };

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
      app.loadRoom(parentId);
      app.document.name = `board-${parentId}`;
      // Turn off the app's own undo / redo stack
      app.pause();
      // Put the state into the window, for debugging
      window.app = app;
      setApp(app);

      // below functions are overwriting the original tldraw implementations
      // some of them had to be changed/fixed to support additional functionality
      app.addMediaFromFiles = async (files, point) => {
        app.setIsLoading(true);

        const shapesToCreate: TDShape[] = [];
        const pointArr = point ?? app.centerPoint;
        const pagePoint = app.getPagePoint(pointArr);

        for (const file of files) {
          try {
            const id = Utils.uniqueId();
            const extension = file.name.match(/\.[0-9a-z]+$/i);

            if (!extension) {
              toast.info("Asset of this type is not allowed");
              continue;
            }

            const isImage = IMAGE_EXTENSIONS.includes(
              extension[0].toLowerCase(),
            );
            const isVideo = VIDEO_EXTENSIONS.includes(
              extension[0].toLowerCase(),
            );

            if (!(isImage || isVideo)) {
              toast.info("Asset of this type is not allowed");
              continue;
            }

            const shapeType = isImage ? TDShapeType.Image : TDShapeType.Video;
            const assetType = isImage ? TDAssetType.Image : TDAssetType.Video;

            let src: string | ArrayBuffer | null;

            if (app.callbacks.onAssetCreate) {
              const result = await app.callbacks.onAssetCreate(app, file, id);

              if (!result)
                throw Error("Asset creation callback returned false");

              src = result;
            } else {
              src = await fileToBase64(file);
            }

            if (typeof src === "string") {
              let size = [0, 0];

              if (isImage) {
                // attempt to get actual svg size from viewBox attribute as
                if (extension[0] == ".svg") {
                  let viewBox: string[];
                  const svgString = await fileToText(file);
                  const viewBoxAttribute = getViewboxFromSVG(app, svgString);

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
                app.getImageOrVideoShapeAtPoint(
                  id,
                  shapeType,
                  pointArr,
                  size,
                  assetId,
                ),
              );
            }
          } catch (error) {
            console.error("An error occurred while uploading asset", error);
          }
        }

        if (shapesToCreate.length) {
          const currentPoint = Vec.add(pagePoint, [0, 0]);

          shapesToCreate.forEach((shape, i) => {
            const bounds = TLDR.getBounds(shape);

            if (i === 0) {
              // For the first shape, offset the current point so
              // that the first shape's center is at the page point
              currentPoint[0] -= bounds.width / 2;
              currentPoint[1] -= bounds.height / 2;
            }

            // Set the shape's point the current point
            shape.point = [...currentPoint];

            // Then bump the page current point by this shape's width
            currentPoint[0] += bounds.width;
          });

          const commonBounds = Utils.getCommonBounds(
            shapesToCreate.map(TLDR.getBounds),
          );

          app.createShapes(...shapesToCreate);

          // Are the common bounds too big for the viewport?
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
          app.addMediaFromFiles(filesToAdd, app.centerPoint);
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
          await importAssetsToS3(document, parentId, user!.schoolId);

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
    [onSaveAs, parentId],
  );

  const onAssetCreate = useCallback(
    async (
      _app: TldrawApp,
      file: File,
      id: string,
    ): Promise<string | false> => {
      if (!envs.TLDRAW_ASSETS_ENABLED) {
        toast.info("Asset uploading is disabled");
        return false;
      }

      if (file.size > envs.TLDRAW_ASSETS_MAX_SIZE_BYTES) {
        const bytesInMb = 1048576;
        const sizeInMb = envs.TLDRAW_ASSETS_MAX_SIZE_BYTES / bytesInMb;
        toast.info(`Asset is too big - max. ${sizeInMb}MB`);
        return false;
      }

      const isMimeTypeDisallowed =
        envs.TLDRAW_ASSETS_ALLOWED_MIME_TYPES_LIST &&
        !envs.TLDRAW_ASSETS_ALLOWED_MIME_TYPES_LIST.includes(file.type);

      if (isMimeTypeDisallowed) {
        toast.info("Asset of this type is not allowed");
        return false;
      }

      try {
        const fileExtension = file.name.split(".").pop()!;
        const url = await uploadFileToStorage(
          file,
          fileExtension,
          id,
          user!.schoolId,
          parentId,
        );

        return url;
      } catch (error) {
        handleError("An error occurred while uploading asset", error);
      }

      return false;
    },
    [parentId],
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

  const onUndo = useCallback(async (app: TldrawApp) => {
    setIsReadOnlyToTrue(app);
    pauseSync();

    const assetsBeforeUndo = [...app.assets];
    undoManager.undo();
    const assetsAfterUndo = [...app.assets];

    try {
      await handleAssets(assetsBeforeUndo, assetsAfterUndo);
    } catch (error) {
      undoManager.redo();
      toast.error("An error occurred while undoing");
    }

    resumeSync();
    setIsReadOnlyToFalse(app);
  }, []);

  const onRedo = useCallback(async (app: TldrawApp) => {
    setIsReadOnlyToTrue(app);
    pauseSync();

    const assetsBeforeRedo = [...app.assets];
    undoManager.redo();
    const assetsAfterRedo = [...app.assets];

    try {
      await handleAssets(assetsBeforeRedo, assetsAfterRedo);
    } catch (error) {
      undoManager.undo();
      toast.error("An error occurred while redoing");
    }

    resumeSync();
    setIsReadOnlyToFalse(app);
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
        link.download = `${parentId}_export.${info.type}`;
        link.click();
      } catch (error) {
        handleError("An error occurred while exporting to image", error);
      }
      app.setIsLoading(false);
    },
    [parentId],
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

  const onAssetDelete = async (app: TldrawApp, id: string) => {
    const asset = app.assets.find((asset) => asset.id === id);
    try {
      if (asset) {
        setIsReadOnlyToTrue(app);

        await deleteAsset(asset);
      }
    } catch (error) {
      undoManager.undo();
      toast.error("An error occurred while deleting asset");
    }

    setIsReadOnlyToFalse(app);
  };

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
    onAssetDelete,
    isReadOnly,
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
