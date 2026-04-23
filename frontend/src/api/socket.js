import { io } from "socket.io-client";
import { API_URL } from "./axios";

// Instantiate the singleton socket (autoConnect is true by default)
const socket = io(API_URL, {
  transports: ["websocket"],
});

export default socket;
