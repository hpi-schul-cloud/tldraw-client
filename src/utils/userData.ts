import { User } from "../types/User";
import { Cookies } from "react-cookie";
import { redirectToLoginPage } from "./redirectUtils";

export const getUserData = async (): Promise<User | undefined> => {
  try {
    const response = await fetch(`/api/v3/user/me`);

    if (!response.ok) {
      if (response.status === 401) {
        // this means jwt is expired
        // remove it and perform redirect to login page
        const cookies = new Cookies();
        cookies.remove("jwt");
        redirectToLoginPage();
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
