// /lib/socket.js
import { io } from "socket.io-client";

let socket;

export function initSocket(authUserId) {
  if (!socket) {
    socket = io("http://localhost:3001", {
      autoConnect: false,
      auth: {
        userId: authUserId,
      },
    });
  }
  return socket;
}
