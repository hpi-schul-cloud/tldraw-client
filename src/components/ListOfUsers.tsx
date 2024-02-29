import { User } from "@y-presence/client";
import { useUsers } from "../hooks/useUsers";
import { UserPresence } from "../types/UserPresence";
import { useEffect, useState } from "react";

function UserListItem({ user }: { user: User<UserPresence> }) {
  const initials = getUserInitials(user.presence.tdUser?.metadata.displayName);

  return (
    <div className="user-data">
      <div
        className="user-icon"
        style={{ backgroundColor: user.presence.tdUser?.color }}>
        {initials}
      </div>
      <span className="user-name">
        {user.presence.tdUser?.metadata.displayName}
      </span>
    </div>
  );
}

function UserList() {
  const [loading, setLoading] = useState(true);
  const users = useUsers();

  useEffect(() => {
    if (users.length > 0) {
      setLoading(false);
    }
  }, [users]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="users-list">
      {users.map((user: User<UserPresence>, index: number) => (
        <UserListItem key={index} user={user} />
      ))}
    </div>
  );
}

function getUserInitials(displayName: string) {
  const nameParts = displayName.split(" ");
  const initials = nameParts.map((part) => part[0].toUpperCase());
  return initials.join("");
}

export default UserList;
