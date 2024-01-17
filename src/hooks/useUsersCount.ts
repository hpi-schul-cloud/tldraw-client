import { useEffect, useState } from "react";
import { User } from "@y-presence/client";
import { UserPresence } from "../types/UserPresence";
import { room } from "../stores/setup";

export function useUsersCount() {
  const [usersCount, setUsersCount] = useState(0);

  const handleUsersChange = (users: User<UserPresence>[]) => {
    setUsersCount(users.length);
  };

  useEffect(() => {
    room.subscribe("users", handleUsersChange);

    return () => {
      room.unsubscribe("users", handleUsersChange);
    };
  }, []);

  return usersCount;
}
