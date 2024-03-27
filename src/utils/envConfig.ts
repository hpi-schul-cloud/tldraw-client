import { Envs } from "../types";
import { API } from "../configuration";
import { ConfigurationMapper } from "../mapper";
import { HttpGuard } from "../guards";

// the try catch should not part of getEnvs, the place that use it must handle the errors
// should be part of a store
// Without loading the config the Promise.all should not be finished and proceed.
export const getEnvs = async (): Promise<Envs | undefined> => {
  try {
    // TODO: check order..
    const response = await fetch(API.ENV_CONFIG);
    HttpGuard.checkStatusOk(response);
    const responseData = await response.json();

    const configuration =
      ConfigurationMapper.mapToConfigurationFromResponse(responseData);

    return configuration;
  } catch (error) {
    // It should exists one place that execute the console.error in the application. A errorHandler.
    // If we want to collect this informations to send it back to us, then we have currently no possibility to implement it.
    console.error("Error fetching env config:", error);
  }
};
