import { User, UserResult } from "../types/User";

export const getUserData = async (): Promise<UserResult> => {
  const userResult: UserResult = {
    user: undefined,
    statusCode: 500,
  };

  try {
    const response = await fetch(`/api/v3/user/me`);
    userResult.statusCode = response.status;

    if (!response.ok) {
      throw new Error(`${response.status} - ${response.statusText}`);
    }

    const data: User = await response.json();
    data.initials =
      data.firstName.charAt(0).toUpperCase() +
      data.lastName.charAt(0).toUpperCase();

    userResult.user = data;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  return userResult;
};
