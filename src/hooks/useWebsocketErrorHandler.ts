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
    translationMessageKey: "error.4401",
  },
  {
    websocketCode: WebsocketStatusCode.NotFound,
    httpCode: HttpStatusCode.NotFound,
    translationMessageKey: "tldraw.error.ws.4404",
  },
  {
    websocketCode: WebsocketStatusCode.NotAcceptable,
    httpCode: HttpStatusCode.NotAcceptable,
    translationMessageKey: "tldraw.error.ws.4406",
  },
  {
    websocketCode: WebsocketStatusCode.InternalServerError,
    httpCode: HttpStatusCode.InternalServerError,
    translationMessageKey: "error.4500",
  },
];

export function useWebsocketErrorHandler() {
  useEffect(() => {
    const handleWsClose = (event: CloseEvent) => {
      let error = websocketErrors.find(
        (element) => element.websocketCode === event.code,
      );

      // This mapping of code 1011 is for the new server, which does not use the above codes.
      // When the transition to the new server is complete, the error handling can be revised.
      if (!error && event.code === 1011) {
        error = websocketErrors.find(
          (websocketError) =>
            websocketError.websocketCode ===
            WebsocketStatusCode.InternalServerError,
        );
      }

      if (!error) return;
      // not acceptable means we have to wait for the server to accept us
      // keep reconnecting
      if (error.websocketCode === WebsocketStatusCode.NotAcceptable) return;

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
