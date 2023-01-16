import { useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { SocketOptions, ManagerOptions, io } from "socket.io-client";

export const useSocket = (
  uri: string,
  opts?: Partial<ManagerOptions & SocketOptions> | undefined
): Socket => {
  const { current: socket } = useRef(io(uri, opts));
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);
  return socket;
};
