import { useCookies } from "react-cookie";
import { useEffect } from "react";
import { redirectToLoginPage } from "../utils/redirectUtils";
import { getRoomId } from "../utils/connectionOptions";

export function useJwtHandler() {
  const [cookies] = useCookies(["jwt"]);
  const token = cookies.jwt;
  const roomId = getRoomId();

  useEffect(() => {
    if (!token) {
      redirectToLoginPage(roomId);
    }
  }, [token]);

  return;
}
