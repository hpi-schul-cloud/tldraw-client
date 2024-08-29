import { API } from "../configuration/api/api.configuration";
import { Envs } from "../types/Envs";
import { HttpStatusCode } from "../types/StatusCodeEnums";
import { getRoomId } from "./connectionOptions";
import { setErrorData } from "./errorData";

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

const handleRedirectIfNotValid = (envs?: Envs) => {
  if (!envs) {
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

export { handleRedirectIfNotValid, redirectToErrorPage, redirectToLoginPage };
