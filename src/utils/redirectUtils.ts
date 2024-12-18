import { Envs } from "../types/Envs";
import { HttpStatusCode } from "../types/StatusCodeEnums";
import { UserResult } from "../types/User";
import { setErrorData } from "./errorData";
import { validateId } from "./validator";
import { getEnvs } from "./envConfig";

const getParentId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const parentId = urlParams.get("parentId") ?? "";

  validateId(parentId);

  return parentId;
};

const redirectToLoginPage = async () => {
  const envs = await getEnvs();
  const parentId = getParentId();
  const redirectUrl =
    envs.NOT_AUTHENTICATED_REDIRECT_URL +
    `&redirect=/tldraw?parentId=${parentId}`;
  window.location.assign(redirectUrl);
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

  if (!envs.FEATURE_TLDRAW_ENABLED) {
    setErrorData(HttpStatusCode.Forbidden, "error.403");
    redirectToErrorPage();
    return;
  }
};

export {
  getParentId,
  handleRedirectIfNotValid,
  redirectToErrorPage,
  redirectToLoginPage,
  redirectToNotFoundErrorPage,
};
