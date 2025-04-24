import { provider } from "../stores/setup";
import { HttpStatusCode, WebsocketStatusCode } from "../types/StatusCodeEnums";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

// the message keys are defined in vue client
const specifiedErrors = [
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
    websocketCode: WebsocketStatusCode.InternalServerError,
    httpCode: HttpStatusCode.InternalServerError,
    translationMessageKey: "error.4500",
  },
  // This mapping of code 1011 is for the new server, which does not use the above codes.
  // When the transition to the new server is complete, the error handling can be revised.
  {
    websocketCode: 1011,
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
