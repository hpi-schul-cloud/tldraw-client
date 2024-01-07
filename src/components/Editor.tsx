import { Tldraw, useFileSystem } from "@tldraw/tldraw";
import { useMultiplayerState } from "../hooks/useMultiplayerState";
import { useButtonRemover } from "../hooks/useButtonRemover";
import { getDarkModeSetting } from "../utils/userSettings";

function Editor({ roomId }: { roomId: string }) {
  const { onSaveProjectAs, onSaveProject, onOpenMedia } = useFileSystem();
  const { onMount, onOpen, saveUserSettings, ...events } =
    useMultiplayerState(roomId);
  const buttonsRef = useButtonRemover();

  return (
    <div ref={buttonsRef}>
      <Tldraw
        autofocus
        showPages={false}
        showMultiplayerMenu={false}
        disableAssets={false}
        onMount={onMount}
        onPatch={saveUserSettings}
        darkMode={getDarkModeSetting()}
        {...events}
        onOpenProject={onOpen}
        onSaveProject={onSaveProject}
        onSaveProjectAs={onSaveProjectAs}
        onOpenMedia={onOpenMedia}
      />
    </div>
  );
}

export default Editor;