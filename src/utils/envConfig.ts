import { Envs } from "../types/Envs";

export const getEnvs = async () => {
  try {
    const response = await fetch(`/api/v1/config/app/public`);

    if (!response.ok && !window.location.host.startsWith("localhost")) {
      console.error(
        "Error fetching env config",
        response.status,
        response.statusText,
      );
    }

    const data: Envs = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching env config:", error);
  }
};
