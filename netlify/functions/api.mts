import express, { Router } from "express";
import serverless from "serverless-http";
import http from "http";
import { Server } from "socket.io";
const PORT = 3000;
const api = express();

const router = Router();
router.get("/", (req, res) => res.send("Hello World!"));

api.use("/api/", router);

// Create Express http server
const server = http.createServer(api);

// Initialize Socket IO on server
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
  },
});

// Server listens on port
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

// Initialize Animal Stats
let hungerLevel = 100;
let isSad = false;

// Start interval that ticks down health and emit hungerLevel to clients
let hungerInterval = setInterval(() => {
  hungerLevel = hungerLevel - 0.5;
  if (hungerLevel < 80) {
    isSad = true;
  } else {
    isSad = false;
  }
  io.sockets.emit("status", { hunger: hungerLevel, isSad: isSad });
  return () => clearInterval(hungerInterval);
}, 1000);

// A user connects to the server (opens a socket)
io.sockets.on("connection", function (socket) {
  // Server recieves a feed ping and updates health
  socket.on("feed", (data) => {
    if (hungerLevel <= 90) {
      hungerLevel = hungerLevel + 10;
    } else {
      hungerLevel = 100;
    }
    console.log("Recieved feed ping: ", data);
    io.sockets.emit("feed", data);
  });
});

export const handler = serverless(api);
