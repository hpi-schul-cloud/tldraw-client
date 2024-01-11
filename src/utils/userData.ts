import { User, UserResponse } from "../types/User";

export const getUserData = async (): Promise<UserResponse> => {
  const userResponse: UserResponse = {
    code: 500,
    user: undefined,
  };

  try {
    const response = await fetch(`/api/v3/user/me`);

    if (!response.ok) {
      userResponse.code = response.status;
      throw new Error(`${response.status} - ${response.statusText}`);
    }

    const data: User = await response.json();
    data.initials =
      data.firstName.charAt(0).toUpperCase() +
      data.lastName.charAt(0).toUpperCase();
    userResponse.user = data;
    userResponse.code = 200;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  return userResponse;
};
