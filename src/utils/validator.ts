import { HttpStatusCode } from "../types/StatusCodeEnums";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

export const validateId = (id: string) => {
  if (!id.match("/^[a-f0-9]{24}$/i")) {
    setErrorData(HttpStatusCode.NotFound, "tldraw.error.ws.404");
    redirectToErrorPage();
  }
};
