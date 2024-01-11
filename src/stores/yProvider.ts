import { TDAsset, TDBinding, TDShape } from "@tldraw/tldraw";
import { Doc, Map, UndoManager } from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Room } from "@y-presence/client";
import { UserPresence } from "../types/UserPresence";
import { getConnectionOptions } from "../utils/connectionOptions";
import { getEnvs } from "../utils/envConfig";
import { getUserData } from "../utils/userData";

let connect = true;

const [connectionOptions, envsResponse, userResponse] = await Promise.all([
  getConnectionOptions(),
  getEnvs(),
  getUserData(),
]);

if (!envsResponse.envs || !userResponse.user) {
  connect = false;
}

const roomId = connectionOptions.roomName;
const doc = new Doc();
const provider = new WebsocketProvider(
  connectionOptions.websocketUrl,
  roomId,
  doc,
  {
    connect,
  },
);

const room = new Room<UserPresence>(provider.awareness, {});
const yShapes: Map<TDShape> = doc.getMap("shapes");
const yBindings: Map<TDBinding> = doc.getMap("bindings");
const yAssets: Map<TDAsset> = doc.getMap("assets");
const undoManager = new UndoManager([yShapes, yBindings, yAssets]);

export {
  envsResponse,
  userResponse,
  roomId,
  doc,
  provider,
  room,
  yShapes,
  yBindings,
  yAssets,
  undoManager,
};
