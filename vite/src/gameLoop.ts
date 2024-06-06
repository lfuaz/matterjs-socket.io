import { Player } from "./class/Player";

const players: Map<string, Player> = new Map();

export function gameLoop(socket: any) {
  function loop() {
    const player = players.get(socket.id as string);
    if (player) {
      player.update();
    }
    requestAnimationFrame(loop);
  }
  loop();
}
