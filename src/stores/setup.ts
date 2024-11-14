import { TDAsset, TDBinding, TDShape } from "@tldraw/tldraw";
import { Room } from "@y-presence/client";
import { Cookies } from "react-cookie";
import { WebsocketProvider } from "y-websocket";
import { Doc, Map, UndoManager } from "yjs";
import { UserPresence } from "../types/UserPresence";
import { getConnectionOptions, getRoomId } from "../utils/connectionOptions";
import { getEnvs } from "../utils/envConfig";
import { clearErrorData } from "../utils/errorData";
import { handleRedirectIfNotValid } from "../utils/redirectUtils";
import { getUserData } from "../utils/userData";
import { setDefaultState } from "../utils/userSettings";

clearErrorData();

const getJwt = () => {
  const cookies = new Cookies();
  const token = cookies.get("jwt");

  return token;
};

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
    params: {
      yauth: getJwt(),
    },
  },
);

const room = new Room<UserPresence>(provider.awareness, {});
const yShapes: Map<TDShape> = doc.getMap("shapes");
const yBindings: Map<TDBinding> = doc.getMap("bindings");
const yAssets: Map<TDAsset> = doc.getMap("assets");
const undoManager = new UndoManager([yShapes, yBindings, yAssets]);

export {
  doc,
  envs,
  provider,
  room,
  roomId,
  undoManager,
  user,
  yAssets,
  yBindings,
  yShapes
};
