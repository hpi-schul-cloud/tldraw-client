import { useState } from "react";
import ReactDOM from "react-dom";
import Icon from "@mdi/react";
import { mdiAccountMultipleOutline } from "@mdi/js";
import ListOfUsers from "./ListOfUsers";
import { useUsers } from "../hooks/useUsers";

function UsersInfo({
  isFocusMode,
  isDarkMode,
}: {
  isFocusMode: boolean;
  isDarkMode?: boolean;
}) {
  const users = useUsers();
  const [showListOfUsers, setShowListOfUsers] = useState(false);

  if (isFocusMode) {
    return null;
  }

  const background = isDarkMode ? "#363d44" : "#FFFFFF";
  const textColor = isDarkMode ? "#F8F9FA" : "#333333";
  const boxShadow = isDarkMode ? "" : "10px 10px 15px 10px rgba(0, 0, 0.13, 0.13)";
  const scrollColor = isDarkMode
    ? "rgba(255, 255, 255, 0.38)"
    : "rgba(0, 0, 0, 0.38)";

  const handleUserDisplayClick = () => {
    setShowListOfUsers(!showListOfUsers);
  };

  return (
    <div className="user-display" onClick={handleUserDisplayClick}>
      <div className="user-count">
        <Icon
          className="user-icon"
          path={mdiAccountMultipleOutline}
          size={"40px"}
          color="#54616E"
        />
      </div>
      <div className="user-indicator">
        <span className="user-indicator-span">{users.length}</span>
      </div>
      {showListOfUsers &&
        ReactDOM.createPortal(
          <div
            className="list-of-users-container"
            style={{
              backgroundColor: background,
              color: textColor,
              boxShadow: boxShadow,
              scrollbarColor: `${scrollColor} transparent`,
            }}>
            <ListOfUsers />
          </div>,
          document.body,
        )}
    </div>
  );
}

export default UsersInfo;
