import { API } from "../configuration/api/api.configuration";
import { HttpGuard } from "../guards/http.guard";
import { ConfigurationMapper } from "../mapper/configuration.mapper";
import { Envs } from "../types/Envs";
import { HttpStatusCode } from "../types/StatusCodeEnums";
import { setErrorData } from "./errorData";
import { redirectToErrorPage } from "./redirectUtils";

// the try catch should not part of getEnvs, the place that use it must handle the errors
// should be part of a store
// Without loading the config the Promise.all should not be finished and proceed.
export const getEnvs = async (): Promise<Envs> => {
  try {
    // TODO: check order..
    const response = await fetch(API.ENV_CONFIG);
    HttpGuard.checkStatusOk(response);
    const responseData = await response.json();

    const configuration =
      ConfigurationMapper.mapToConfigurationFromResponse(responseData);

    return configuration;
  } catch (error) {
    if (import.meta.env.PROD) {
      setErrorData(HttpStatusCode.InternalServerError, "error.500");
      redirectToErrorPage();
      throw error;
    } else {
      return {
        TLDRAW__WEBSOCKET_URL: "ws://localhost:3345",
        ASSETS_ENABLED: true,
        ASSETS_MAX_SIZE_BYTES: 10485760,
        ASSETS_ALLOWED_MIME_TYPES_LIST: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/svg+xml",
        ],
        FEATURE_TLDRAW_ENABLED: true,
      } as unknown as Envs;
    }
  }
};
