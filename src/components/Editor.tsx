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
  focusModeHandler,
}: {
  roomId: string;
  darkModeHandler: (isDarkMode: boolean) => void;
  focusModeHandler: (isFocusMode: boolean) => void;
}) {
  const { onOpenMedia, onOpenProject } = useFileSystem();
  const {
    onMount,
    onSave,
    onAssetCreate,
    onPatch,
    onExport,
    onAssetDelete,
    isReadOnly,
    ...events
  } = useMultiplayerState({
    roomId,
    setIsDarkMode: darkModeHandler,
    setIsFocusMode: focusModeHandler,
  });
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
        onExport={onExport}
        darkMode={isDarkMode}
        {...events}
        onOpenProject={onOpenProject}
        onSaveProject={onSave}
        onSaveProjectAs={onSave}
        onOpenMedia={onOpenMedia}
        onAssetCreate={onAssetCreate}
        onAssetDelete={onAssetDelete}
        showStyles={isReadOnly}
        showZoom={isReadOnly}
        readOnly={!isReadOnly}
      />
    </div>
  );
}

export default Editor;
