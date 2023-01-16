import { useContext, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { useSocket } from "./hooks/useSocket";
import { SocketContext } from "./context/Socket/Context";

function App() {
  const { socket, uid, users } = useContext(SocketContext).SocketState;
  return (
    <div className="App">
      <h2>Socket IO information</h2>
      <p>
        Your user id: <strong>{uid}</strong>
        <br />
        Users online: <strong>{users.length}</strong>
        <br />
        Socket id: <strong>{socket?.id}</strong>
        <br />
      </p>
    </div>
  );
}

export default App;
