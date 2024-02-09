import { useEffect } from "react";
import { provider } from "../stores/setup";
import { redirectToErrorPage } from "../utils/redirectUtils";
import { setErrorData } from "../utils/errorData";
import { HttpStatusCode, WebsocketStatusCode } from "../types/StatusCodeEnums";

// the message keys are defined in vue client
const websocketErrors = [
  {
    websocketCode: WebsocketStatusCode.BadRequest,
    httpCode: HttpStatusCode.NotFound,
    translationMessageKey: "tldraw.error.ws.4400",
  },
  {
    websocketCode: WebsocketStatusCode.Unauthorized,
    httpCode: HttpStatusCode.Unauthorized,
    translationMessageKey: "tldraw.error.ws.4401",
  },
  {
    websocketCode: WebsocketStatusCode.NotFound,
    httpCode: HttpStatusCode.NotFound,
    translationMessageKey: "tldraw.error.ws.4404",
  },
  {
    websocketCode: WebsocketStatusCode.InternalServerError,
    httpCode: HttpStatusCode.InternalServerError,
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
