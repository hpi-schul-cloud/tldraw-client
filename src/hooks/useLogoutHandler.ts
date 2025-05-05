import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { redirectToLoginPage } from "../utils/redirectUtils";

export const useLogoutHandler = () => {
  const [cookies] = useCookies(["isLoggedIn"]);
  const isLoggedIn = cookies.isLoggedIn;

  useEffect(() => {
    if (!isLoggedIn) {
      redirectToLoginPage();
    }
  }, [isLoggedIn]);
};
