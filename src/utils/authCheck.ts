import { API } from "../configuration/api/api.configuration";
import { HttpStatusCode } from "../types/StatusCodeEnums";
import { redirectToLoginPage } from "./redirectUtils";

export const checkIfAuthenticated = async () => {
  const res = await fetch(API.CHECK_AUTHENTICATION);

  if (res.status === HttpStatusCode.Unauthorized) {
    redirectToLoginPage();
  }
};
