import { Cookies } from "react-cookie";
import { getRoomId } from "./connectionOptions";
import { UserResult } from "../types/User";
import { Envs } from "../types/Envs";
import { setErrorData } from "./errorData";
import { HttpStatusCode } from "../types/StatusCodeEnums";

export const redirectToLoginPage = () => {
  const roomId = getRoomId();
  if (import.meta.env.PROD) {
    window.location.assign(`/login?redirect=/tldraw?roomName=${roomId}`);
  } else {
    window.location.assign(
      `http://localhost:4000/login?redirect=tldraw?roomName=${roomId}`,
    );
  }
};

export const redirectToErrorPage = () => {
  if (import.meta.env.PROD) {
    window.location.assign("/error");
  } else {
    console.warn("Prevented redirect to /error page");
  }
};

export const handleRedirectIfNotValid = (
  userResult: UserResult,
  envs?: Envs,
) => {
  if (userResult.statusCode === HttpStatusCode.Unauthorized) {
    // this means jwt is expired
    // remove it to perform redirect to login page
    const cookies = new Cookies();
    cookies.remove("jwt");
    return;
  }

  if (!envs || !userResult.user) {
    setErrorData(HttpStatusCode.InternalServerError, "tldraw.error.500");
    redirectToErrorPage();
    return;
  }

  if (!envs!.FEATURE_TLDRAW_ENABLED) {
    setErrorData(HttpStatusCode.Forbidden, "tldraw.error.403");
    redirectToErrorPage();
    return;
  }
};
