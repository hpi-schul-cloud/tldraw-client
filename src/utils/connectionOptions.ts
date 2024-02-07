import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";
import { HttpStatusCode } from "../types/StatusCodeEnums";

const getConnectionOptions = async (): Promise<{
  websocketUrl: string;
}> => {
  const connectionOptions = {
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
      setErrorData(HttpStatusCode.InternalServerError, "tldraw.error.500");
      redirectToErrorPage();
    }
  }

  return connectionOptions;
};

const getRoomId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("roomName") ?? "";

  return roomId;
};

export { getConnectionOptions, getRoomId };
