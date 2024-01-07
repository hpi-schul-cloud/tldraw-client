import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { roomId } from "./stores/yProvider";
import ErrorModal from "./components/ErrorModal";
import UsersInfo from "./components/UsersInfo";
import Editor from "./components/Editor";
import "./App.scss";

function App() {
  const [cookies] = useCookies(["jwt"]);
  const token = cookies.jwt;

  useEffect(() => {
    if (!token) {
      if (window.location.host.startsWith("localhost")) {
        window.location.href = `http://localhost:4000/login?redirect=tldraw?roomName=${roomId}`;
      } else {
        window.location.href = `/login?redirect=/tldraw?roomName=${roomId}`;
      }
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
