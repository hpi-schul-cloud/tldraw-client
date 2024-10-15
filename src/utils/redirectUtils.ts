import { getParentId } from "./connectionOptions";
import { UserResult } from "../types/User";
import { Envs } from "../types/Envs";
import { setErrorData } from "./errorData";
import { HttpStatusCode } from "../types/StatusCodeEnums";
import { API } from "../configuration/api/api.configuration";

const redirectToLoginPage = () => {
  const parentId = getParentId();
  if (import.meta.env.PROD) {
    const redirectUrl = API.LOGIN_REDIRECT.replace("PARENTID", parentId);
    window.location.assign(redirectUrl);
  } else {
    window.location.assign(
      `http://localhost:4000/login?redirect=tldraw?parentId=${parentId}`,
    );
  }
};

const redirectToErrorPage = () => {
  if (import.meta.env.PROD) {
    window.location.assign("/error");
  } else {
    console.warn("Prevented redirect to /error page");
  }
};

const redirectToNotFoundErrorPage = () => {
  setErrorData(HttpStatusCode.NotFound, "error.404");
  redirectToErrorPage();
};

const handleRedirectIfNotValid = (userResult: UserResult, envs?: Envs) => {
  if (userResult.statusCode === HttpStatusCode.Unauthorized) {
    redirectToLoginPage();
    return;
  }

  if (!envs || !userResult.user) {
    setErrorData(HttpStatusCode.InternalServerError, "error.500");
    redirectToErrorPage();
    return;
  }

  if (!envs!.FEATURE_TLDRAW_ENABLED) {
    setErrorData(HttpStatusCode.Forbidden, "error.403");
    redirectToErrorPage();
    return;
  }
};

export {
  redirectToLoginPage,
  redirectToErrorPage,
  redirectToNotFoundErrorPage,
  handleRedirectIfNotValid,
};
