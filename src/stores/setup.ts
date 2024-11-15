import { TDAsset, TDBinding, TDShape } from "@tldraw/tldraw";
import { Room } from "@y-presence/client";
import { WebsocketProvider } from "y-websocket";
import { Doc, Map, UndoManager } from "yjs";
import { UserPresence } from "../types/UserPresence";
import { getEnvs } from "../utils/envConfig";
import { clearErrorData } from "../utils/errorData";
import {
  getParentId,
  handleRedirectIfNotValid,
} from "../utils/redirectUtils";
import { getUserData } from "../utils/userData";
import { setDefaultState } from "../utils/userSettings";

clearErrorData();

const [envs, userResult] = await Promise.all([getEnvs(), getUserData()]);

handleRedirectIfNotValid(userResult, envs);

setDefaultState();

const user = userResult.user;
const parentId = getParentId();
const doc = new Doc();
const provider = new WebsocketProvider(
  envs?.TLDRAW__WEBSOCKET_URL,
  parentId,
  doc,
  {
    connect: true,
    disableBc: true,
  },
);

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
