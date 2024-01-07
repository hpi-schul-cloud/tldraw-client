import { TDAsset, TDBinding, TDShape } from "@tldraw/tldraw";
import { Doc, Map, UndoManager } from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Room } from "@y-presence/client";
import { UserPresence } from "../types/UserPresence";
import { getConnectionOptions } from "../utils/connectionOptions";

const connectionOptions = await getConnectionOptions();

export const roomId = connectionOptions.roomName;
export const doc = new Doc();
export const provider = new WebsocketProvider(
  connectionOptions.websocketUrl,
  roomId,
  doc,
  {},
);

export const room = new Room<UserPresence>(provider.awareness, {});
export const yShapes: Map<TDShape> = doc.getMap("shapes");
export const yBindings: Map<TDBinding> = doc.getMap("bindings");
export const yAssets: Map<TDAsset> = doc.getMap("assets");
export const undoManager = new UndoManager([yShapes, yBindings, yAssets]);
