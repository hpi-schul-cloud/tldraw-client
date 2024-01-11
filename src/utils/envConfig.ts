import { EnvsResponse } from "../types/Envs";

export const getEnvs = async () => {
  const envsResponse: EnvsResponse = {
    code: 500,
    envs: undefined,
  };

  try {
    const response = await fetch(`/api/v1/config/app/public`);

    if (!response.ok) {
      envsResponse.code = response.status;
      throw new Error(`${response.status} - ${response.statusText}`);
    }

    envsResponse.envs = await response.json();
    envsResponse.code = 200;
  } catch (error) {
    console.error("Error fetching env config:", error);
  }

  return envsResponse;
};
