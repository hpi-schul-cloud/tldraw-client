import Icon from "@mdi/react";
import { mdiAccountMultipleOutline } from "@mdi/js";
import { useUsersCount } from "../hooks/useUsersCount";

function UsersInfo() {
  const usersCount = useUsersCount();

  return (
    <div className="user-display">
      <div className="user-count">
        <Icon
          className="user-icon"
          path={mdiAccountMultipleOutline}
          size={"40px"}
          color="#54616E"
        />
      </div>
      <div className="user-indicator">
        <span className="user-indicator-span">{usersCount}</span>
      </div>
    </div>
  );
}

export default UsersInfo;
