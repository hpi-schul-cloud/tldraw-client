import { Envs } from "../types";
import { API } from "../configuration";
import { ConfigurationMapper } from "../mapper";
import { HttpGuard } from "../guards";

// the try catch should not part of getEnvs, the place that use it must handle the errors
// should be part of a store
export const getEnvs = async (): Promise<Envs|undefined> => {
  try {
    // TODO: check order..
    const response = await fetch(API.ENV_CONFIG);
    HttpGuard.checkStatusOk(response);
    const json = await response.json();
   
    const configuration = ConfigurationMapper.mapToConfigurationFromResponse(json);

    return configuration;
  } catch (error) {
    console.error("Error fetching env config:", error);
  }
};
