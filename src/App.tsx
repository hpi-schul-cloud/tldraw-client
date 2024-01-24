import { ToastContainer } from "react-toastify";
import UsersInfo from "./components/UsersInfo";
import Editor from "./components/Editor";
import { useJwtHandler } from "./hooks/useJwtHandler";
import { roomId } from "./stores/setup";
import { getDarkModeSetting } from "./utils/userSettings";
import { useState } from "react";

function App() {
  useJwtHandler();
  const isDarkMode = getDarkModeSetting();
  const [isFocusMode, setIsFocusMode] = useState(false);

  return (
    <div>
      <div className="tldraw-content">
        <UsersInfo isFocusMode={isFocusMode} />
        <div className="tldraw">
          <Editor roomId={roomId} setIsFocusMode={setIsFocusMode} />
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        limit={1}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
      />
    </div>
  );
}

export default App;
