import { TDAsset, TDBinding, TDShape } from "@tldraw/tldraw";
import { Room } from "@y-presence/client";
import { WebsocketProvider } from "y-websocket";
import { Doc, Map, UndoManager } from "yjs";
import { UserPresence } from "../types/UserPresence";
import { checkIfAuthenticated } from "../utils/authCheck";
import { handleWsClose } from "../utils/closeHandler";
import { getEnvs } from "../utils/envConfig";
import { clearErrorData } from "../utils/errorData";
import {
  getParentId,
  handleRedirectIfNotValid,
  redirectToNotFoundErrorPage,
} from "../utils/redirectUtils";
import { getUserData } from "../utils/userData";
import { setDefaultState } from "../utils/userSettings";

clearErrorData();

const [envs, userResult] = await Promise.all([getEnvs(), getUserData()]);

// Since neither the tldraw server nor the tldraw client is informed when a user logs out of the Schulcloud,
// we check here periodically if the user is still authenticated.
setInterval(checkIfAuthenticated, 10 * 1000);

handleRedirectIfNotValid(userResult, envs);

setDefaultState();

const user = userResult.user;
const parentId = getParentId();
const doc = new Doc();
const provider = new WebsocketProvider(
  envs?.TLDRAW_WEBSOCKET_URL,
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

provider.on("connection-close", (event: CloseEvent) => {
  handleWsClose(event);
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
  doc,
  envs,
  parentId,
  pauseSync,
  provider,
  resumeSync,
  room,
  undoManager,
  user,
  yAssets,
  yBindings,
  yShapes,
};
