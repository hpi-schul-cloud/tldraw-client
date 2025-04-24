import { provider } from "../stores/setup";
import { HttpStatusCode, WebsocketCloseCode } from "../types/StatusCodeEnums";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

// the message keys are defined in vue client
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

export const handleWsClose = (event: CloseEvent) => {
  const specifiedError = specifiedErrors.find(
    (element) => element.websocketCode === event.code,
  );

  // Any error that is not specified above should lead to a reconnection attempt.
  if (!specifiedError) return;

  setErrorData(specifiedError.httpCode, specifiedError.translationMessageKey);
  redirectToErrorPage();

  provider.disconnect();
};
