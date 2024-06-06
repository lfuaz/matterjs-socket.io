import { Engine, Events } from "matter-js";
import { Player } from "./class/Player";
import { World } from "matter-js";

export function setupEventHandlers(engine: Engine, socket: any, world: World) {
  const players: Map<string, Player> = new Map();

  Events.on(engine, "forceApplied", function (event: any) {
    console.log("Force applied to body:", event.body);
    console.log("Position:", event.position);
    console.log("Force:", event.force);
  });

  Events.on(engine, "collisionStart", (event) => {
    const { pairs } = event;
    pairs.forEach((pair) => {
      const player = players.get(socket.id as string);
      if (
        player &&
        (pair.bodyA === player.body || pair.bodyB === player.body)
      ) {
        player.isGrounded = true;
      }
    });
  });

  // Keydown event handler
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const player = players.get(socket.id as string);
    if (player) {
      if (event.key === "ArrowLeft") {
        player.moveLeft();
      } else if (event.key === "ArrowRight") {
        player.moveRight();
      } else if (event.key === "ArrowUp") {
        player.jump();
      }
    }
  });

  // Other event handlers (to be implemented)
}
