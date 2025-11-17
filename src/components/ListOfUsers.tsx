import { User } from "@y-presence/client";
import { UserPresence } from "../types/UserPresence";

function UserListItem({ user }: { user: User<UserPresence> }) {
  return (
    <div className="user-data">
      <div
        className="user-icon"
        style={{ backgroundColor: user.presence.tdUser?.color }}>
        {user.presence.tdUser?.metadata.initials}
      </div>
      <span className="user-name">
        {user.presence.tdUser?.metadata.displayName}
      </span>
    </div>
  );
}

function UserList({ users }: { users: User<UserPresence>[] }) {
  const loading = users.length === 0;

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

export default UserList;
