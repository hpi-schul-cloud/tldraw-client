import { Tldraw, useFileSystem } from "@tldraw/tldraw";
import { useRef } from "react";
import { useMultiplayerState } from "../hooks/useMultiplayerState";
import { useTldrawSettings } from "../hooks/useTldrawSettings";
import { useTldrawUiSanitizer } from "../hooks/useTldrawUiSanitizer";
import CustomCursor from "./CustomCursor";

function Editor({
  parentId,
  darkModeHandler,
  focusModeHandler,
}: {
  parentId: string;
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
    parentId,
    setIsDarkMode: darkModeHandler,
    setIsFocusMode: focusModeHandler,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  useTldrawUiSanitizer(containerRef);
  const { isDarkMode } = useTldrawSettings();

  const components = {
    Cursor: CustomCursor,
  };

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
        showStyles={!isReadOnly}
        showZoom={!isReadOnly}
        readOnly={isReadOnly}
      />
    </div>
  );
}

export default Editor;
