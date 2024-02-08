import { HttpStatusCode } from "../types/StatusCodeEnums";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

export const validateId = (id: string) => {
  if (!id.match("/^[a-f0-9]{24}$")) {
    setErrorData(HttpStatusCode.NotFound, "tldraw.error.ws.4404");
    redirectToErrorPage();
  }
};
