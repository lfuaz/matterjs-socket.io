import { setupEngine, runEngine } from "./engine";
import { setupSocket } from "./socket";
import { setupEventHandlers } from "./eventHandler";
import { gameLoop } from "./gameLoop";

// Initialize the engine
const { engine, render, world, ground } = setupEngine();
runEngine(engine, render);

// Initialize the socket
const socket = setupSocket(world, ground);

// Setup event handlers
setupEventHandlers(engine, socket, world);

// Start the game loop
gameLoop(socket);
