import { User } from "../types/User";
import { Cookies } from "react-cookie";

export const getUserData = async (): Promise<User | undefined> => {
  try {
    const response = await fetch(`/api/v3/user/me`);

    if (!response.ok) {
      if (response.status === 401) {
        // this means jwt is expired
        // remove it to perform redirect to login page
        const cookies = new Cookies();
        cookies.remove("jwt");
      }

      throw new Error(`${response.status} - ${response.statusText}`);
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
