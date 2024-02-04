import {
  TDAsset,
  TDBinding,
  TDDocument,
  TDFile,
  TDShape,
  TDUser,
  TldrawApp,
  TldrawPatch,
  useFileSystem,
} from "@tldraw/tldraw";
import { User } from "@y-presence/client";
import { useCallback, useEffect, useState } from "react";
import { fileOpen } from "browser-fs-access";
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
  const { onOpenProject } = useFileSystem();

  // Callbacks --------------

  const onOpen = useCallback(
    async (
      app: TldrawApp,
      openDialog: (
        dialogState: "saveFirstTime" | "saveAgain",
        onYes: () => Promise<void>,
        onNo: () => Promise<void>,
        onCancel: () => Promise<void>,
      ) => void,
    ) => {
      undoManager.stopCapturing();
      await onOpenProject(app, openDialog);
      app.openProject = async () => {
        try {
          const result = await openFromFileSystem();
          if (!result) {
            console.error("Error while opening file");
            toast.error("An error occured while opening file");
            return;
          }

          const { document } = result;

          yShapes.clear();
          yBindings.clear();
          yAssets.clear();
          undoManager.clear();

          updateDoc(
            document.pages.page.shapes,
            document.pages.page.bindings,
            document.assets,
          );

          app.zoomToContent();
          app.zoomToFit();
        } catch (e) {
          console.error("Error while opening project", e);
          toast.error("An error occured while opening project");
        }
      };
    },
    [onOpenProject],
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
        toast.info(
          `Asset is too big - max. ${
            envs!.TLDRAW__ASSETS_MAX_SIZE / 1000000
          }MB`,
        );
        return false;
      }

      undoManager.stopCapturing();
      const fileExtension = file.name.split(".").pop()!;
      if (
        envs!.TLDRAW__ASSETS_ALLOWED_EXTENSIONS_LIST &&
        !envs!.TLDRAW__ASSETS_ALLOWED_EXTENSIONS_LIST.includes(fileExtension)
      ) {
        toast.info("Asset with this extension is not allowed");
        return false;
      }

      try {
        const fileToUpload = new File([file], `${id}.${fileExtension}`, {
          type: file.type,
        });

        const formData = new FormData();
        formData.append("file", fileToUpload);

        const response = await fetch(
          `/api/v3/file/upload/${user!.schoolId}/boardnodes/${roomId}`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error(`${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data.url;
      } catch (error) {
        console.error("Error while uploading asset:", error);
        toast.error("An error occured while uploading asset");
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

  const onMount = useCallback(
    (app: TldrawApp) => {
      app.loadRoom(roomId);
      app.document.name = `room_${roomId}`;
      // Turn off the app's own undo / redo stack
      app.pause();
      // Put the state into the window, for debugging
      window.app = app;
      setApp(app);
    },
    [roomId],
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
    };
    room.updatePresence({ tdUser });
  }, []);

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
    onOpen,
    onChangePage,
    onChangePresence,
    loading,
    onPatch,
    onAssetCreate,
  };
}

const openFromFileSystem = async (): Promise<null | {
  fileHandle: FileSystemFileHandle | null;
  document: TDDocument;
}> => {
  // Get the blob
  const blob = await fileOpen({
    description: "Tldraw File",
    extensions: [".tldr"],
    multiple: false,
  });

  if (!blob) return null;

  // Get JSON from blob
  const json: string = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState === FileReader.DONE) {
        resolve(reader.result as string);
      }
    };
    reader.readAsText(blob, "utf8");
  });

  // Parse
  const file: TDFile = JSON.parse(json);
  if ("tldrawFileFormatVersion" in file) {
    console.error(
      "This file was created in a newer version of tldraw and it cannot be opened",
    );
    toast.info(
      "This file was created in a newer version of tldraw and it cannot be opened",
    );
    return null;
  }

  const fileHandle = blob.handle ?? null;

  return {
    fileHandle,
    document: file.document,
  };
};

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
