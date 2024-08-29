import { API } from "../configuration/api/api.configuration";
import { HttpStatusCode } from "../types/StatusCodeEnums";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

export const checkAuthz = async (roomId: string) => {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify({
      context: {
        action: "read",
        requiredPermissions: ["COURSE_EDIT"],
      },
      referenceType: "boardnodes",
      referenceId: roomId,
    }),
  };

  const res = await fetch(API.AUTHZ, requestOptions);

  if (!res.ok) {
    setErrorData(HttpStatusCode.InternalServerError, "error.500");
    redirectToErrorPage();
    throw new Error("Internal Server Error");
  }

  const data = await res.json();

  if (!data.isAuthorized) {
    setErrorData(HttpStatusCode.Forbidden, "error.403");
    redirectToErrorPage();
    throw new Error("Forbidden");
  }
};
