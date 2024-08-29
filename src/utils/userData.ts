import { API } from "../configuration/api/api.configuration";
import { HttpStatusCode } from "../types/StatusCodeEnums";
import { User, UserResult } from "../types/User";
import { setErrorData } from "./errorData";
import { redirectToErrorPage, redirectToLoginPage } from "./redirectUtils";

export const getUserData = async (): Promise<UserResult> => {
  const response = await fetch(API.USER_DATA);

  if (response.status === HttpStatusCode.Unauthorized) {
    redirectToLoginPage();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    setErrorData(HttpStatusCode.InternalServerError, "error.500");
    redirectToErrorPage();
    throw new Error("Internal Server Error");
  }

  const data: User = await response.json();
  data.initials =
    data.firstName.charAt(0).toUpperCase() +
    data.lastName.charAt(0).toUpperCase();

  const userResult = { user: data, statusCode: response.status };

  return userResult;
};
