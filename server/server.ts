import http from "http";
import express from "express";
import { ServerSocket } from "./socket";

const app = express();
const httpServer = http.createServer(app);

new ServerSocket(httpServer);

httpServer.listen("3001", () => {
  console.info("Server is running");
});
