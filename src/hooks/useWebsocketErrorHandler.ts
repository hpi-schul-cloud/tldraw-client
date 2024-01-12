import { useEffect } from "react";
import { provider } from "../stores/setup";
import { redirectToErrorPage } from "../utils/redirectUtils";
import { setErrorData } from "../utils/setErrorData";

// the message keys are defined in vue client
const websocketErrors = [
  {
    websocketCode: 4400,
    httpCode: 404,
    translationMessageKey: "tldraw.error.ws.4400",
  },
  {
    websocketCode: 4401,
    httpCode: 401,
    translationMessageKey: "tldraw.error.ws.4401",
  },
  {
    websocketCode: 4404,
    httpCode: 404,
    translationMessageKey: "tldraw.error.ws.4404",
  },
  {
    websocketCode: 4500,
    httpCode: 500,
    translationMessageKey: "tldraw.error.ws.4500",
  },
];

export function useWebsocketErrorHandler() {
  useEffect(() => {
    const handleWsClose = (event: CloseEvent) => {
      const error = websocketErrors.find(
        (element) => element.websocketCode === event.code,
      );
      if (!error) return;

      setErrorData(error.httpCode, error.translationMessageKey);
      redirectToErrorPage();

      provider.disconnect();
    };

    provider.ws?.addEventListener("close", handleWsClose);

    return () => {
      provider.ws?.removeEventListener("close", handleWsClose);
    };
  }, []);

  return;
}
