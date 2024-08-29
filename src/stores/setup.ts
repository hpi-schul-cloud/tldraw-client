import { TDAsset, TDBinding, TDShape } from "@tldraw/tldraw";
import { Doc, Map, UndoManager } from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Room } from "@y-presence/client";
import { UserPresence } from "../types/UserPresence";
import { getConnectionOptions, getRoomId } from "../utils/connectionOptions";
import { getEnvs } from "../utils/envConfig";
import { getUserData } from "../utils/userData";
import { handleRedirectIfNotValid } from "../utils/redirectUtils";
import { clearErrorData } from "../utils/errorData";
import { setDefaultState } from "../utils/userSettings";

clearErrorData();

const [connectionOptions, envs, user] = await Promise.all([
  getConnectionOptions(),
  getEnvs(),
  getUserData(),
]);

handleRedirectIfNotValid(envs);

setDefaultState();

const roomId = getRoomId();
const doc = new Doc();
const provider = new WebsocketProvider(
  connectionOptions.websocketUrl,
  roomId,
  doc,
  {
    connect: true,
  },
);

const room = new Room<UserPresence>(provider.awareness, {});
const yShapes: Map<TDShape> = doc.getMap("shapes");
const yBindings: Map<TDBinding> = doc.getMap("bindings");
const yAssets: Map<TDAsset> = doc.getMap("assets");
const undoManager = new UndoManager([yShapes, yBindings, yAssets]);

export {
  envs,
  user,
  roomId,
  doc,
  provider,
  room,
  yShapes,
  yBindings,
  yAssets,
  undoManager,
};
