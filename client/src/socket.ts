// socket.ts
import io, { Socket } from "socket.io-client";
import { World } from "matter-js";
import { Player } from "./class/Player";
import { Ground } from "./class/Ground";
import { PlayerData, PositionData } from "./types";

const players: Map<string, Player> = new Map();

export function setupSocket(world: World, ground: Ground) {
  const socket = io(import.meta.env.VITE_SERVER_URL || "http://127.0.0.1:3000");

  socket.on("connect", () => handleConnect(socket, world, ground));

  socket.on("showPlayers", (playersData: PlayerData[]) =>
    handleShowPlayers(playersData, socket, world, ground)
  );

  socket.on("newPlayer", (playerData: PlayerData) =>
    handleNewPlayer(playerData, world, ground, socket.id as string)
  );

  socket.on("playerDisconnected", (playerId: string) =>
    handlePlayerDisconnected(playerId, world)
  );

  socket.on("playerPosition", (playerData: PositionData) =>
    handlePlayerPosition(playerData)
  );

  return socket;
}

function handleConnect(socket: any, world: World, ground: Ground) {
  const color = randomHexcolor();
  console.log("Connected with ID:", socket.id);

  socket.emit("showPlayers");

  const playerData: PlayerData = {
    id: socket.id,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    width: 40,
    height: 40,
    angle: 0,
    color: color,
  };

  socket.emit("newPlayer", playerData);

  createPlayer(playerData, world, ground);
}

function handleShowPlayers(
  playersData: PlayerData[],
  socket: Socket,
  world: World,
  ground: Ground
) {
  playersData.forEach((playerData) => {
    if (playerData.id !== socket.id) {
      createPlayer(playerData, world, ground);
    }
  });
}

function handleNewPlayer(
  playerData: PlayerData,
  world: World,
  ground: Ground,
  socketId: string
) {
  if (playerData.id !== socketId) {
    createPlayer(playerData, world, ground);
  }
}

function handlePlayerDisconnected(playerId: string, world: World) {
  const player = players.get(playerId);
  if (player) {
    World.remove(world, player.body);
    players.delete(playerId);
  }
}

function handlePlayerPosition(playerData: PositionData) {
  const player = players.get(playerData.id);
  if (player) {
    player.body.position.x = playerData.x;
    player.body.position.y = playerData.y;
  }
}

function createPlayer(playerData: PlayerData, world: World, ground: Ground) {
  const newPlayer = new Player(
    playerData.id,
    playerData.x,
    playerData.y,
    playerData.width,
    playerData.height,
    world,
    window.innerWidth,
    window.innerHeight,
    0.008,
    0.1,
    playerData.angle,
    playerData.color,
    ground
  );
  players.set(playerData.id, newPlayer);
}

function randomHexcolor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
