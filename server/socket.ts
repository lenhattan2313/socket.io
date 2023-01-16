import { Server as HTTPSever } from "http";
import { Socket, Server } from "socket.io";
import { v4 } from "uuid";

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;

  public users: {
    [uid: string]: string;
  };
  constructor(server: HTTPSever) {
    ServerSocket.instance = this;
    this.users = {};
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10_000,
      pingTimeout: 5_000,
      cookie: false,
      cors: {
        origin: "http://localhost:5173",
      },
    });
    this.io.on("connect", this.StartListeners);
    console.info("SOCKET IO started");
  }
  StartListeners = (socket: Socket) => {
    console.info("Message receive from " + socket.id);
    socket.on("handshake", (callback: (uid: string, users: string[]) => {}) => {
      console.info("Handshake received from " + socket.id);
      //check if this is reconnection
      const reconnected = Object.values(this.users).includes(socket.id);
      if (reconnected) {
        console.info("This user has reconnected");
        const uid = this.GetUidFromSocketId(socket.id);
        const users = Object.values(this.users);
        if (uid) {
          console.info("Sending callback for reconnect");
          callback(uid, users);
          return;
        }
      }
      //generate new user
      const uid = v4();
      this.users[uid] = socket.id;
      const users = Object.values(this.users);

      console.info("Sending callback for reconnect");
      callback(uid, users);

      //Send new user to all connected user
      this.SendMessage(
        "user_connected",
        users.filter((id) => id !== socket.id),
        users
      );
    });
    socket.on("disconnect", () => {
      console.info("Disconnect received from " + socket.id);
      const uid = this.GetUidFromSocketId(socket.id);
      if (uid) {
        delete this.users[uid];
        const users = Object.values(this.users);
        console.info(uid);
        this.SendMessage("user_disconnected", users, socket.id);
      }
    });
  };
  GetUidFromSocketId = (id: string) =>
    Object.keys(this.users).find((uid) => this.users[uid] === id);
  SendMessage = (name: string, users: string[], payload?: Object) => {
    console.info("Emitting event: ", name);
    users.forEach((id) =>
      payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name)
    );
  };
}
