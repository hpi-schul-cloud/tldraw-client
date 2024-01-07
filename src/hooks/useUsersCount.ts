import { useEffect, useState } from "react";
import { room } from "../stores/yProvider";

export function useUsersCount() {
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    const unsubUsers = room.subscribe("users", (users) => {
      setUsersCount(users.length);
    });

    return () => {
      unsubUsers();
    };
  }, []);

  return usersCount;
}
