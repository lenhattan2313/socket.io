import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Socket } from "socket.io-client";
import { useSocket } from "../../hooks/useSocket";
export interface ISocketState {
  socket: Socket | undefined;
  uid: string;
  users: string[];
}
export const initialSocketState: ISocketState = {
  socket: undefined,
  uid: "",
  users: [],
};

export type TSocketActions =
  | "update_socket"
  | "update_uid"
  | "update_users"
  | "remove_user";
export type TSocketPayload = string | string[] | Socket;

export interface ISocketActions {
  type: TSocketActions;
  payload: TSocketPayload;
}

export const SocketReducer = (state: ISocketState, action: ISocketActions) => {
  console.log(
    `Message received - Action: ${action.type} - Payload: `,
    action.payload
  );
  switch (action.type) {
    case "update_socket":
      return {
        ...state,
        socket: action.payload as Socket,
      };
    case "update_uid":
      return {
        ...state,
        uid: action.payload as string,
      };
    case "update_users":
      return {
        ...state,
        users: action.payload as string[],
      };
    case "remove_user":
      return {
        ...state,
        users: state.users.filter((u) => u !== (action.payload as string)),
      };
    default:
      return { ...state };
  }
};

export const SocketContext = createContext<{
  SocketState: ISocketState;
  SocketDispatch: React.Dispatch<ISocketActions>;
}>({
  SocketState: initialSocketState,
  SocketDispatch: () => {},
});

interface SocketProviderProps extends PropsWithChildren {}
export const SocketProvider: React.FC<SocketProviderProps> = (props) => {
  const [SocketState, SocketDispatch] = useReducer(
    SocketReducer,
    initialSocketState
  );
  const socket = useSocket("ws://localhost:3001", {
    reconnectionAttempts: 5,
    reconnectionDelay: 5_000,
    autoConnect: false,
  });
  useEffect(() => {
    // Connect to the socket
    socket.connect();

    // Save socket to context
    SocketDispatch({
      type: "update_socket",
      payload: socket,
    });
    // Start the event listener
    StartListener();
    //Send the handshake
    SendHandShake();
  }, []);
  const StartListener = () => {
    socket.on("user_connected", (users: string[]) => {
      console.info("User connected, new user list received");
      SocketDispatch({ type: "update_users", payload: users });
    });
    socket.on("user_disconnected", (uid: string) => {
      console.info("User connected, new user list received");
      SocketDispatch({ type: "remove_user", payload: uid });
    });
    //default event of io
    socket.io.on("reconnect", (attempt) => {
      console.info("Reconnected on attempt: ", attempt);
    });
    socket.io.on("reconnect_attempt", (attempt) => {
      console.info("Reconnection attempt: ", attempt);
    });
    socket.io.on("reconnect_error", (error) => {
      console.info("Reconnection error: ", error);
    });
    socket.io.on("reconnect_failed", () => {
      console.info("Reconnection failed");
      alert("Cannot connect to the web socket");
    });
  };
  const SendHandShake = () => {
    console.info("Sending handshake to server");
    socket.emit("handshake", (uid: string, users: string[]) => {
      console.info("Handshake received");
      SocketDispatch({ type: "update_uid", payload: uid });
      SocketDispatch({ type: "update_users", payload: users });
    });
  };

  return (
    <SocketContext.Provider value={{ SocketState, SocketDispatch }}>
      {props.children}
    </SocketContext.Provider>
  );
};
