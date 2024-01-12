import { Envs } from "../types/Envs";

export const getEnvs = async (): Promise<Envs | undefined> => {
  try {
    const response = await fetch(`/api/v1/config/app/public`);

    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching env config:", error);
  }
};
