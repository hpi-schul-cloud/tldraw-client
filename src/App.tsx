import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { roomId } from "./stores/yProvider";
import ErrorModal from "./components/ErrorModal";
import UsersInfo from "./components/UsersInfo";
import Editor from "./components/Editor";
import { redirectToLogin } from "./utils/redirectToLogin";
import "./App.scss";

function App() {
  const [cookies] = useCookies(["jwt"]);
  const token = cookies.jwt;

  useEffect(() => {
    if (!token) {
      redirectToLogin();
    }
  }, [token]);

  return (
    <div>
      {token && (
        <div className="tldraw-content">
          <UsersInfo />
          <div className="tldraw">
            <Editor roomId={roomId} />
          </div>
          <ErrorModal />
        </div>
      )}
    </div>
  );
}

export default App;
