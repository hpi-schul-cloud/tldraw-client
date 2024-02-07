import { Envs } from "../types/Envs";
import { ENV_CONFIG_API } from "../configuration/api";

export const getEnvs = async (): Promise<Envs | undefined> => {
  try {
    const response = await fetch(ENV_CONFIG_API);

    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching env config:", error);
  }
};
