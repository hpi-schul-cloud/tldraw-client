import { useEffect, useState } from "react";
import { User } from "@y-presence/client";
import { UserPresence } from "../types/UserPresence";
import { room } from "../stores/setup";

export function useUsers() {
  const [users, setUsers] = useState<User<UserPresence>[]>([]);

  useEffect(() => {
    const handleUsersChange = (updatedUsers: User<UserPresence>[]) => {
      setUsers(updatedUsers);
    };

    room.subscribe("users", handleUsersChange);

    return () => {
      room.unsubscribe("users", handleUsersChange);
    };
  }, []);

  return users;
}
