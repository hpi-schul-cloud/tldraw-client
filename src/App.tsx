import UsersInfo from "./components/UsersInfo";
import Editor from "./components/Editor";
import { useJwtHandler } from "./hooks/useJwtHandler";
import { roomId } from "./stores/setup";

function App() {
  useJwtHandler();

  return (
    <div>
      <div className="tldraw-content">
        <UsersInfo />
        <div className="tldraw">
          <Editor roomId={roomId} />
        </div>
      </div>
      )
    </div>
  );
}

export default App;
