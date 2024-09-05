import { TDAsset, TDBinding, TDShape } from "@tldraw/tldraw";
import { Doc, Map, UndoManager } from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Room } from "@y-presence/client";
import { UserPresence } from "../types/UserPresence";
import { getConnectionOptions, getRoomId } from "../utils/connectionOptions";
import { getEnvs } from "../utils/envConfig";
import { getUserData } from "../utils/userData";
import {
  handleRedirectIfNotValid,
  redirectToNotFoundErrorPage,
} from "../utils/redirectUtils";
import { clearErrorData } from "../utils/errorData";
import { setDefaultState } from "../utils/userSettings";
import * as decoding from "lib0/decoding";

clearErrorData();

const [connectionOptions, envs, userResult] = await Promise.all([
  getConnectionOptions(),
  getEnvs(),
  getUserData(),
]);

handleRedirectIfNotValid(userResult, envs);

setDefaultState();

const user = userResult.user;
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

if (provider.ws?.onmessage) {
  const originalOnMessage = provider.ws.onmessage.bind(provider.ws);

  provider.on("status", (event) => {
    if (!provider.ws?.onmessage) return;

    if (event.status === "connected") {
      provider.ws.onmessage = (event) => {
        const message = new Uint8Array(event.data);
        const decoder = decoding.createDecoder(message);
        const messageType = decoding.readVarUint(decoder);
        console.log("Received message typ:", messageType);

        if (messageType === 3) {
          const messageContent = decoding.readVarString(decoder);
          console.log("Received message content:", messageContent);
          if (messageContent === "deleted") {
            redirectToNotFoundErrorPage();
          } else {
            originalOnMessage(event);
          }
        } else {
          originalOnMessage(event);
        }
      };
    }
  });
}

const pauseSync = () => {
  provider.disconnect();
};

const resumeSync = () => {
  provider.connect();
};

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
  pauseSync,
  resumeSync,
};
