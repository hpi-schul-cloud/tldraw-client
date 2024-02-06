import { useCookies } from "react-cookie";
import { useEffect } from "react";
import { redirectToLoginPage } from "../utils/redirectUtils";

export function useJwtHandler() {
  const [cookies] = useCookies(["jwt"]);
  const token = cookies.jwt;

  useEffect(() => {
    if (!token) {
      redirectToLoginPage();
    }
  }, [token]);

  return;
}
