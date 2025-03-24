import { UserResult } from "../types/User";
import { HttpStatusCode } from "../types/StatusCodeEnums";
import { API } from "../configuration/api/api.configuration";
import { mapMeResponseToUser } from "../mapper/me-response.mapper";

export const getUserData = async (): Promise<UserResult> => {
  const userResult: UserResult = {
    user: undefined,
    statusCode: HttpStatusCode.InternalServerError,
  };

  try {
    const response = await fetch(API.USER_DATA);
    userResult.statusCode = response.status;

    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    const user = mapMeResponseToUser(data);

    userResult.user = user;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  return userResult;
};
