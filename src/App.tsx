import { ToastContainer } from "react-toastify";
import UsersInfo from "./components/UsersInfo";
import Editor from "./components/Editor";
import { parentId } from "./stores/setup";
import { useTldrawSettings } from "./hooks/useTldrawSettings";
import { checkAuthentication } from "./utils/authCheck";
import { useEffect } from "react";

function App() {
  const {
    isDarkMode,
    isFocusMode,
    handleDarkModeChange,
    handleFocusModeChange,
  } = useTldrawSettings();

  useEffect(() => {
    // Since neither the tldraw server nor the tldraw client is informed when a user logs out of the Schulcloud,
    // we check here periodically if the user is still authenticated.
    const interval = setInterval(checkAuthentication, 10 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
