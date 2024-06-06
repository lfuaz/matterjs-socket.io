const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.ORIGIN || "http://192.168.1.42:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// Use CORS middleware
app.use(
  cors({
    origin: process.env.ORIGIN || "http://192.168.1.42:5173",
  })
);

// Serve static files from the public directory
app.use(express.static("public"));

const players = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle player movement
  socket.on("playerMove", (data) => {
    io.emit("playerMove", data);
  });

  // Handle player jump
  socket.on("playerJump", (data) => {
    io.emit("playerJump", data);
  });

  socket.on("newPlayer", (data) => {
    data["id"] = socket.id;
    //emit playerConnected
    players.set(socket.id, data);
    io.emit("playerConnected", data);
  });

  socket.on("disconnect", () => {
    io.emit("playerDisconnected", socket.id);
    players.delete(socket.id);
  });

  socket.on("showPlayers", () => {
    //send every players position the asker

    players.forEach((player) => {
      if (player.id !== socket.id) {
        socket.emit("playerConnected", player);
      }
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port http://0.0.0.0:${PORT}`);
});
