import { HttpStatusCode } from "../types/StatusCodeEnums";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

export const validateId = (id: string) => {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    setErrorData(HttpStatusCode.NotFound, "tldraw.error.ws.4404");
    redirectToErrorPage();
  }
};
