import { useEffect } from "react";
import { checkAuthentication } from "../utils/authCheck";

export const useAuthCheck = () => {
  useEffect(() => {
    // Since neither the tldraw server nor the tldraw client is informed when a user logs out of the Schulcloud,
    // we check here periodically if the user is still authenticated.
    const interval = setInterval(checkAuthentication, 10 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
};
