import { ConnectionOptions } from "../types/ConnectionOptions";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

export const getConnectionOptions = async (): Promise<ConnectionOptions> => {
  const urlParams = new URLSearchParams(window.location.search);

  const connectionOptions = {
    roomName: urlParams.get("roomName") ?? "",
    websocketUrl: "ws://localhost:3345",
  };

  if (import.meta.env.PROD) {
    try {
      const response = await fetch("/tldraw-client-runtime.config.json");

      if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}`);
      }

      const data: { tldrawServerURL: string } = await response.json();
      connectionOptions.websocketUrl = data.tldrawServerURL;
    } catch (error) {
      console.error("Error fetching tldrawServerURL:", error);
      setErrorData(500, "tldraw.error.500");
      redirectToErrorPage();
    }
  }

  return connectionOptions;
};
