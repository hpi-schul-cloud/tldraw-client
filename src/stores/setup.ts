import { TDAsset, TDBinding, TDShape } from "@tldraw/tldraw";
import { Doc, Map, UndoManager } from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Room } from "@y-presence/client";
import { UserPresence } from "../types/UserPresence";
import { getConnectionOptions, getParentId } from "../utils/connectionOptions";
import { getEnvs } from "../utils/envConfig";
import { getUserData } from "../utils/userData";
import {
  handleRedirectIfNotValid,
  redirectToNotFoundErrorPage,
} from "../utils/redirectUtils";
import { clearErrorData } from "../utils/errorData";
import { setDefaultState } from "../utils/userSettings";

clearErrorData();

const [connectionOptions, envs, userResult] = await Promise.all([
  getConnectionOptions(),
  getEnvs(),
  getUserData(),
]);

handleRedirectIfNotValid(userResult, envs);

setDefaultState();

const user = userResult.user;
const parentId = getParentId();
const doc = new Doc();
const provider = new WebsocketProvider(
  connectionOptions.websocketUrl,
  parentId,
  doc,
  {
    connect: true,
  },
);

provider.on("status", (event: { status: string }) => {
  if (!provider.ws?.onmessage || event.status !== "connected") return;

  const originalOnMessage = provider.ws.onmessage.bind(provider.ws);

  provider.ws.onmessage = (messageEvent) => {
    if (messageEvent.data === "action:delete") {
      provider.disconnect();
      redirectToNotFoundErrorPage();
    } else {
      originalOnMessage(messageEvent);
    }
  };
});

const room = new Room<UserPresence>(provider.awareness, {});
const yShapes: Map<TDShape> = doc.getMap("shapes");
const yBindings: Map<TDBinding> = doc.getMap("bindings");
const yAssets: Map<TDAsset> = doc.getMap("assets");
const undoManager = new UndoManager([yShapes, yBindings, yAssets]);

const pauseSync = () => {
  provider.disconnect();
};

const resumeSync = () => {
  provider.connect();
};

export {
  envs,
  user,
  parentId,
  doc,
  provider,
  room,
  yShapes,
  yBindings,
  yAssets,
  undoManager,
  pauseSync,
  resumeSync,
};
