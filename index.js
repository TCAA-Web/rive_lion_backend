const express = require("express");
const app = express();
const http = require("http");
const PORT = 3000;

// Create Express http server
const server = http.createServer(app);

// Server listens on port
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

// Initialize Socket IO on server
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "https://rive-lion.netlify.app",
  },
});

// Initialize Animal Stats
let hungerLevel = 100;
let isSad = false;

// Start interval that ticks down health every 5 seconds and emit hungerLevel to clients
setInterval(() => {
  hungerLevel = hungerLevel - 0.5;
  if (hungerLevel < 80) {
    isSad = true;
  } else {
    isSad = false;
  }
  io.sockets.emit("status", { hunger: hungerLevel, isSad: isSad });
}, 5000);

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
