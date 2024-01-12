import { Tldraw, useFileSystem } from "@tldraw/tldraw";
import { useMultiplayerState } from "../hooks/useMultiplayerState";
import { useButtonRemover } from "../hooks/useButtonRemover";
import { getDarkModeSetting } from "../utils/userSettings";
import CustomCursor from "./CustomCursor";
import { useWebsocketErrorHandler } from "../hooks/useWebsocketErrorHandler";

function Editor({ roomId }: { roomId: string }) {
  const { onSaveProjectAs, onSaveProject, onOpenMedia } = useFileSystem();
  const { onMount, onOpen, onAssetCreate, onAssetDelete, onPatch, ...events } =
    useMultiplayerState(roomId);
  const buttonsRef = useButtonRemover();

  const components = {
    Cursor: CustomCursor,
  };

  useWebsocketErrorHandler();

  return (
    <div ref={buttonsRef}>
      <Tldraw
        components={components}
        autofocus
        showPages={false}
        showMultiplayerMenu={false}
        disableAssets={false}
        onMount={onMount}
        onPatch={onPatch}
        darkMode={getDarkModeSetting()}
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
