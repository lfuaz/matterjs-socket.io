import {
  Engine,
  Render,
  Runner,
  Composite,
  Mouse,
  MouseConstraint,
  Body,
  Events,
  World,
} from "matter-js";
import { Player } from "./class/Player";
import { Ground } from "./class/Ground";

import io from "socket.io-client";

const socket = io("http://192.168.1.42:3000");

// Create an engine
const engine = Engine.create();
const world = engine.world;

// Create a renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
  },
});

Render.run(render);

// Create a runner
const runner = Runner.create();
Runner.run(runner, engine);

const originalApplyForce = Body.applyForce;
Body.applyForce = function (body, position, force) {
  originalApplyForce.call(Body, body, position, force);

  // Create and dispatch a custom event
  const event = {
    type: "forceApplied",
    body: body,
    position: position,
    force: force,
  };
  Events.trigger(engine, "forceApplied", event);
};

// Listen for the custom forceApplied event
Events.on(engine, "forceApplied", function (event: any) {
  console.log("Force applied to body:", event.body);
  console.log("Position:", event.position);
  console.log("Force:", event.force);
});

const players: Map<string, Player> = new Map();

const size = 80;
// Create the ground
const ground: Ground = new Ground(
  innerWidth / 2,
  innerHeight - size / 2,
  innerWidth,
  size,
  world
);

// Create a mouse and mouse constraint
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.1,
    render: {
      visible: true,
    },
  },
});

// Add the mouse constraint to the world
Composite.add(world, mouseConstraint);

// Keep the mouse in sync with the renderer
render.mouse = mouse;

// Track player's grounded state
Events.on(engine, "collisionStart", (event) => {
  const { pairs } = event;
  pairs.forEach((pair) => {
    const player = players.get(socket.id as string);
    if (player && (pair.bodyA === player.body || pair.bodyB === player.body)) {
      player.isGrounded = true;
    }
  });
});

// Wait for socket connection
socket.on("connect", () => {
  const color = randomHexcolor();
  console.log("Connected with ID:", socket.id);

  // Notify the server of a new player
  socket.emit("newPlayer", {
    id: socket.id,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    width: 40,
    height: 40,
    angle: 0,
    color: color,
  });

  // Create a new player
  const newPlayer = new Player(
    window.innerWidth / 2,
    window.innerHeight / 2,
    40,
    40,
    world,
    window.innerWidth,
    innerHeight,
    0.008,
    0.1,
    0,
    color
  );
  players.set(socket.id as string, newPlayer);

  // show other players previously connected
  socket.emit("showPlayers");

  // Handle player movement
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const player = players.get(socket.id as string);
    if (player) {
      if (event.key === "ArrowLeft") {
        player.moveLeft();
      } else if (event.key === "ArrowRight") {
        player.moveRight();
      } else if (event.key === "ArrowUp") {
        player.jump(ground);
      }
    }
  });
});

socket.on(
  "playerJump",
  (data: { id: string; x: number; y: number; angle: number }) => {
    // Handle other players' jumps
    if (data.id !== socket.id) {
      const otherPlayer = players.get(data.id);
      if (otherPlayer) {
        Body.setPosition(otherPlayer.body, { x: data.x, y: data.y });
        otherPlayer.jump(ground);
      }
    }
  }
);

socket.on("showPlayers", (data: any) => {
  console.log(data);

  for (const player of data) {
    if (player.id !== socket.id) {
      const newPlayer = new Player(
        player.x,
        player.y,
        player.width,
        player.height,
        world,
        window.innerWidth,
        player.angle,
        player.color // Pass the color here
      );
      players.set(player.id, newPlayer);
    }
  }
});

socket.on(
  "playerConnected",
  (data: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    color: string;
  }) => {
    const { id, x, y, width, height, angle, color } = data;

    if (!players.get(id)) {
      const newPlayer = new Player(
        x,
        y,
        width,
        height,
        world,
        window.innerWidth,
        window.innerHeight,
        0.008,
        0.1,
        angle,
        color // Pass the color here
      );
      players.set(id, newPlayer);
    }
  }
);

socket.on(
  "playerMove",
  (data: { id: string; x: number; y: number; angle: number }) => {
    const { id, x, y, angle } = data;
    const otherPlayer: Player = players.get(id) as Player;

    if (otherPlayer && id !== socket.id) {
      // Ensure you don't move the local player
      Body.setPosition(otherPlayer.body, { x, y });
      Body.setAngle(otherPlayer.body, angle);
    }
  }
);

socket.on("playerDisconnected", (id: string) => {
  if (players.get(id)) {
    const player: Player = players.get(id) as Player;

    World.remove(world, player.body);
    players.delete(id);
  }
});

// Hot Module Replacement (HMR) setup
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    document.body.removeChild(render.canvas);
    Engine.clear(engine);
    render.canvas.remove();
    render.context = render.canvas.getContext("2d") as CanvasRenderingContext2D;
    render.textures = {};
  });
}

// Game loop to update player position
function gameLoop() {
  const player = players.get(socket.id as string);
  if (player) {
    player.update(ground);
  }

  requestAnimationFrame(gameLoop);
}

function emitPlayerPosition() {
  const player = players.get(socket.id as string);
  if (player) {
    socket.emit("playerMove", {
      id: socket.id,
      x: player.body.position.x,
      y: player.body.position.y,
      angle: player.body.angle,
    });
  }
}

Events.on(engine, "afterUpdate", function () {
  emitPlayerPosition();
});

function randomHexcolor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

gameLoop();
