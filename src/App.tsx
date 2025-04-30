import { ToastContainer } from "react-toastify";
import Editor from "./components/Editor";
import UsersInfo from "./components/UsersInfo";
import { useAuthCheck } from "./hooks/useAuthCheck";
import { useTldrawSettings } from "./hooks/useTldrawSettings";
import { parentId } from "./stores/setup";

function App() {
  console.log("App component rendered");

  const {
    isDarkMode,
    isFocusMode,
    handleDarkModeChange,
    handleFocusModeChange,
  } = useTldrawSettings();

  useAuthCheck();

  return (
    <div>
      <div className="tldraw-content">
        <UsersInfo isFocusMode={isFocusMode} isDarkMode={isDarkMode} />
        <div className="tldraw">
          <Editor
            parentId={parentId}
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
