import { ToastContainer } from "react-toastify";
import UsersInfo from "./components/UsersInfo";
import Editor from "./components/Editor";
import { useJwtHandler } from "./hooks/useJwtHandler";
import { roomId } from "./stores/setup";
import { useTldrawSettings } from "./hooks/useTldrawSettings";

function App() {
  useJwtHandler();
  const { isDarkMode, handleDarkModeChange } = useTldrawSettings();

  return (
    <div>
      <div className="tldraw-content">
        <UsersInfo />
        <div className="tldraw">
          <Editor roomId={roomId} darkModeHandler={handleDarkModeChange} />
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
