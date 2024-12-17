import {
  PublicSystemListResponse,
  PublicSystemResponse,
} from "../types/PublicSystemListResponse";
import { HttpGuard } from "../guards/http.guard";
import { API } from "../configuration/api/api.configuration";

export const getSystems = async (): Promise<PublicSystemResponse[]> => {
  let systems: PublicSystemResponse[] = [];

  try {
    const response = await fetch(API.SYSTEMS_PUBLIC);
    HttpGuard.checkStatusOk(response);
    const responseData: PublicSystemListResponse = await response.json();
    systems = responseData.data;
  } catch (error) {
    console.error("Error fetching systems:", error);
  }

  return systems;
};
