import { useEffect, useState } from "react";
import { provider, roomId } from "../stores/yProvider";

const websocketErrors = [
  {
    code: 4400,
    message:
      "Room name is missing in URL params or tldraw feature is disabled.",
    showRedirectButton: false,
  },
  {
    code: 4401,
    message:
      "You don't have permission to this board or your session expired. Try logging in again.",
    showRedirectButton: true,
  },
  {
    code: 4404,
    message: "Board not found.",
    showRedirectButton: false,
  },
  {
    code: 4500,
    message: "Unable to establish websocket connection. Try again later.",
    showRedirectButton: false,
  },
];

export function useWebsocketErrorHandler() {
  const [infoModal, setInfoModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRedirectButton, setShowRedirectButton] = useState(false);

  const handleClose = () => {
    setInfoModal(false);
  };

  const handleRedirect = () => {
    if (window.location.host.startsWith("localhost")) {
      window.location.href = `http://localhost:4000/login?redirect=tldraw?roomName=${roomId}`;
    } else {
      window.location.href = `/login?redirect=/tldraw?roomName=${roomId}`;
    }
  };

  useEffect(() => {
    const handleWsClose = (event: CloseEvent) => {
      const error = websocketErrors.find(
        (element) => element.code === event.code,
      );
      if (!error) return;

      setErrorMessage(error.message);
      setShowRedirectButton(error.showRedirectButton);
      setInfoModal(true);

      provider.disconnect();
    };

    provider.ws?.addEventListener("close", handleWsClose);

    return () => {
      provider.ws?.removeEventListener("close", handleWsClose);
    };
  }, []);

  return {
    infoModal,
    showRedirectButton,
    errorMessage,
    handleClose,
    handleRedirect,
  };
}
