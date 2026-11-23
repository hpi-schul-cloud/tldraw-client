import { TDAsset, TDBinding, TDShape } from "@tldraw/tldraw";
import { Room } from "@y-presence/client";
import { WebsocketProvider } from "y-websocket";
import { Doc, Map, UndoManager } from "yjs";
import { Envs } from "../types/Envs";
import { UserResult } from "../types/User";
import { UserPresence } from "../types/UserPresence";
import { createAwarenessWatchdog } from "../utils/awarenessWatchdog";
import { handleWsClose } from "../utils/closeHandler";
import { showConnectionErrorAndReload } from "../utils/connectionErrorHandler";
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

let envs: Envs, userResult: UserResult;

try {
  [envs, userResult] = await Promise.all([getEnvs(), getUserData()]);
} catch (error) {
  console.error("Failed to initialize application:", error);
  // Redirect to error page or show fallback UI
  throw new Error("Application initialization failed");
}

handleRedirectIfNotValid(userResult, envs);

setDefaultState();

const user = userResult.user;
const parentId = getParentId();
const doc = new Doc();

// State for tracking provider connection status and cleanup
let isProviderConnected = false;
let wsMessageInterceptor: ((event: MessageEvent) => void) | null = null;

const provider = new WebsocketProvider(
  envs?.TLDRAW_WEBSOCKET_URL,
  parentId,
  doc,
  {
    connect: true,
  },
);

provider.on("status", (event: { status: string }) => {
  if (!provider.ws || event.status !== "connected") return;

  // Clean up previous interceptor if exists
  if (wsMessageInterceptor && provider.ws.onmessage === wsMessageInterceptor) {
    wsMessageInterceptor = null;
  }

  // Store original handler safely
  const originalOnMessage = provider.ws.onmessage as
    | ((event: MessageEvent) => void)
    | null;

  // Create new interceptor function
  wsMessageInterceptor = (messageEvent: MessageEvent) => {
    if (messageEvent.data === "action:delete") {
      // Clean up safely before disconnecting
      if (provider.ws && provider.ws.onmessage === wsMessageInterceptor) {
        provider.ws.onmessage = originalOnMessage;
      }
      provider.disconnect();
      redirectToNotFoundErrorPage();
      return;
    }

    // Call original handler if it exists
    if (originalOnMessage) {
      originalOnMessage.call(provider.ws, messageEvent);
    }
  };

  // Set new interceptor
  provider.ws.onmessage = wsMessageInterceptor;
  isProviderConnected = true;
});

provider.on("connection-close", (event: CloseEvent | null) => {
  if (!event) return;

  handleWsClose(event, provider);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
provider.on("connection-error", (_event: Event) => {
  // Prevent automatic reconnection attempts that could cause infinite loops
  if (isProviderConnected) {
    provider.disconnect();
    isProviderConnected = false;
  }

  showConnectionErrorAndReload(
    "Failed to connect to server. The page will reload in 10 seconds...",
  );
});

const room = new Room<UserPresence>(provider.awareness, {});
const yShapes: Map<TDShape> = doc.getMap("shapes");
const yBindings: Map<TDBinding> = doc.getMap("bindings");
const yAssets: Map<TDAsset> = doc.getMap("assets");
const undoManager = new UndoManager([yShapes, yBindings, yAssets]);

const pauseSync = () => {
  if (isProviderConnected) {
    provider.disconnect();
    isProviderConnected = false;
  }
};

const resumeSync = () => {
  if (!isProviderConnected) {
    provider.connect();
    // isProviderConnected will be set to true in the status event handler
  }
};

// Automatically cleanup when page is closed/refreshed
const handlePageUnload = () => {
  console.log("🧹 Page unloading, cleaning up awareness resources...");
  cleanup();
};

// Cleanup function for when the module is unloaded
const cleanup = () => {
  console.log("🧹 Cleaning up all awareness resources...");

  // Clean up watchdog
  if (cleanupWatchdog) {
    cleanupWatchdog();
  }

  // Remove page unload listeners
  window.removeEventListener("beforeunload", handlePageUnload);
  window.removeEventListener("unload", handlePageUnload);
  window.removeEventListener("popstate", handlePageUnload);

  // Restore original WebSocket onmessage if we modified it
  if (
    provider.ws &&
    wsMessageInterceptor &&
    provider.ws.onmessage === wsMessageInterceptor
  ) {
    provider.ws.onmessage = null;
  }

  // Disconnect provider
  if (isProviderConnected) {
    provider.disconnect();
  }

  // Clean up room
  room.destroy();

  // Clear undo manager
  undoManager.clear();
};

let cleanupWatchdog: (() => void) | null = null;
// Always enable the watchdog to fix awareness interval issues
cleanupWatchdog = createAwarenessWatchdog(provider);

// Listen for page unload events
window.addEventListener("beforeunload", handlePageUnload);
window.addEventListener("unload", handlePageUnload);

// For React/SPA: cleanup on navigation away
window.addEventListener("popstate", handlePageUnload);

export {
  cleanup,
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
