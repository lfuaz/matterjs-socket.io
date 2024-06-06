const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.ORIGIN || "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

// Use CORS middleware
app.use(
  cors({
    origin: process.env.ORIGIN || "http://127.0.0.1:5173",
  })
);

// Serve static files from the public directory
app.use(express.static("public"));

const players = new Map();

io.on("connection", (socket) => {
  console.info("A user connected:", socket.id);

  socket.on("newPlayer", (data) => {
    data["id"] = socket.id;

    players.set(socket.id, data);
    io.emit("playerConnected", data);
  });

  socket.on("showPlayers", () => {
    players.forEach((player) => {
      if (player.id !== socket.id) {
        socket.emit("playerConnected", player);
      }
    });
  });

  socket.on("playerPosition", (data) => {
    io.emit("playerPosition", data);
  });

  socket.on("disconnect", () => {
    console.info("A user disconnected:", socket.id);
    io.emit("playerDisconnected", socket.id);
    players.delete(socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.info(`Server is running on port http://0.0.0.0:${PORT}`);
});
