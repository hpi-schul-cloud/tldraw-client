import { useCookies } from "react-cookie";
import { useEffect } from "react";
import { redirectToLoginPage } from "../utils/redirectUtils";
import { getRoomId } from "../utils/connectionOptions";

export function useJwtHandler() {
  const [cookies] = useCookies(["jwt"]);
  const token = cookies.jwt;
  const roomId = getRoomId();

  console.log("token", token);
  useEffect(() => {
    if (!token) {
      console.log("redirected from useJwtHandler");
      redirectToLoginPage(roomId);
    }
  }, [roomId, token]);

  return;
}
