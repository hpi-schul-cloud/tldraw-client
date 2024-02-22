import { ToastContainer } from "react-toastify";
import UsersInfo from "./components/UsersInfo";
import Editor from "./components/Editor";
import { useJwtHandler } from "./hooks/useJwtHandler";
import { roomId } from "./stores/setup";
import { useTldrawSettings } from "./hooks/useTldrawSettings";

function App() {
  useJwtHandler();
  const {
    isDarkMode,
    isFocusMode,
    handleDarkModeChange,
    handleFocusModeChange,
  } = useTldrawSettings();

  return (
    <div>
      <div className="tldraw-content">
        <UsersInfo isFocusMode={isFocusMode} isDarkMode={isDarkMode}/>
        <div className="tldraw">
          <Editor
            roomId={roomId}
            darkModeHandler={handleDarkModeChange}
            focusModeHandler={handleFocusModeChange}
          />
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
