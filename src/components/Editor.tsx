import { useRef } from "react";
import { Tldraw, useFileSystem } from "@tldraw/tldraw";
import { useMultiplayerState } from "../hooks/useMultiplayerState";
import { useTldrawUiSanitizer } from "../hooks/useTldrawUiSanitizer";
import { useWebsocketErrorHandler } from "../hooks/useWebsocketErrorHandler";
import CustomCursor from "./CustomCursor";
import { useTldrawSettings } from "../hooks/useTldrawSettings";

function Editor({
  roomId,
  darkModeHandler,
}: {
  roomId: string;
  darkModeHandler: (isDarkMode: boolean) => void;
}) {
  const { onSaveProjectAs, onSaveProject, onOpenMedia } = useFileSystem();
  const { onMount, onOpen, onAssetCreate, onAssetDelete, onPatch, ...events } =
    useMultiplayerState(roomId, darkModeHandler);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useTldrawUiSanitizer(containerRef);
  const { isDarkMode } = useTldrawSettings();

  const components = {
    Cursor: CustomCursor,
  };

  useWebsocketErrorHandler();

  return (
    <div ref={containerRef}>
      <Tldraw
        components={components}
        autofocus
        showPages={false}
        showMultiplayerMenu={false}
        disableAssets={false}
        onMount={onMount}
        onPatch={onPatch}
        darkMode={isDarkMode}
        {...events}
        onOpenProject={onOpen}
        onSaveProject={onSaveProject}
        onSaveProjectAs={onSaveProjectAs}
        onOpenMedia={onOpenMedia}
        onAssetCreate={onAssetCreate}
        onAssetDelete={onAssetDelete}
      />
    </div>
  );
}

export default Editor;
