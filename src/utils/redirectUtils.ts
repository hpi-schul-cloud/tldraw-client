import { API } from "../configuration/api/api.configuration";
import { Envs } from "../types/Envs";
import { HttpStatusCode } from "../types/StatusCodeEnums";
import { UserResult } from "../types/User";
import { setErrorData } from "./errorData";
import { validateId } from "./validator";

const getRoomId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("roomName") ?? "";

  validateId(roomId);

  return roomId;
};

const redirectToLoginPage = () => {
  const roomId = getRoomId();
  if (import.meta.env.PROD) {
    const redirectUrl = API.LOGIN_REDIRECT.replace("ROOMID", roomId);
    window.location.assign(redirectUrl);
  } else {
    window.location.assign(
      `http://localhost:4000/login?redirect=tldraw?roomName=${roomId}`,
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
  getRoomId,
  handleRedirectIfNotValid,
  redirectToErrorPage,
  redirectToLoginPage,
  redirectToNotFoundErrorPage,
};
