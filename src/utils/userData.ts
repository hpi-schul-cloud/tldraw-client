import { User } from "../types/User";

export const getUserData = async () => {
  try {
    const response = await fetch(`/api/v3/user/me`);

    if (!response.ok && !window.location.host.startsWith("localhost")) {
      console.error(
        "Error fetching user data",
        response.status,
        response.statusText,
      );
    }

    const data: User = await response.json();
    data.initials =
      data.firstName.charAt(0).toUpperCase() +
      data.lastName.charAt(0).toUpperCase();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};
