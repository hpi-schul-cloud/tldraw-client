import { ToastContainer } from "react-toastify";
import UsersInfo from "./components/UsersInfo";
import Editor from "./components/Editor";
import { useJwtHandler } from "./hooks/useJwtHandler";
import { roomId } from "./stores/setup";
import { useTldrawSettings } from "./hooks/useTldrawSettings";
import { ContextProvider } from "./components/Context";
import { useState } from "react";

function App() {
  useJwtHandler();
  const { isDarkMode, handleDarkModeChange } = useTldrawSettings();
  const [zoom, setZoom] = useState(0);

  return (
    <ContextProvider value={{ zoom }}>
      <div>
        <div className="tldraw-content">
          <UsersInfo />
          <div className="tldraw">
            <Editor
              roomId={roomId}
              darkModeHandler={handleDarkModeChange}
              setZoom={setZoom}
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
    </ContextProvider>
  );
}

export default App;
