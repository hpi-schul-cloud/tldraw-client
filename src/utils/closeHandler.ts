import { WebsocketProvider } from "y-websocket";
import { HttpStatusCode, WebsocketCloseCode } from "../types/StatusCodeEnums";
import { showConnectionErrorAndReload } from "./connectionErrorHandler";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

// The translation keys are defined in the vue client.
const specifiedErrors = [
  {
    websocketCode: WebsocketCloseCode.Unauthorized,
    httpCode: HttpStatusCode.Unauthorized,
    translationMessageKey: "error.4401",
  },
  {
    websocketCode: WebsocketCloseCode.NotFound,
    httpCode: HttpStatusCode.NotFound,
    translationMessageKey: "tldraw.error.ws.4404",
  },
  {
    websocketCode: WebsocketCloseCode.InternalError,
    httpCode: HttpStatusCode.InternalServerError,
    translationMessageKey: "error.4500",
  },
];

export const handleWsClose = (
  event: CloseEvent,
  provider: WebsocketProvider,
) => {
  const specifiedError = specifiedErrors.find(
    (element) => element.websocketCode === event.code,
  );

  // Disconnect provider to prevent automatic reconnection
  provider.disconnect();

  if (specifiedError) {
    // For specified errors, use the original error page redirection
    setErrorData(specifiedError.httpCode, specifiedError.translationMessageKey);
    redirectToErrorPage();
  } else {
    // For any other connection failure, show error message and force reload
    showConnectionErrorAndReload(
      "Connection to server lost. The page will reload in 10 seconds...",
    );
  }
};
