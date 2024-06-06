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
import { Ground } from "./class/Ground";

export function setupEngine() {
  const engine = Engine.create();
  const world = engine.world;

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
  const runner = Runner.create();
  Runner.run(runner, engine);

  // Create the ground
  const size = 80;
  const ground = new Ground(
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

  Composite.add(world, mouseConstraint);
  render.mouse = mouse;

  return { engine, render, world, ground };
}

export function runEngine(engine: Engine, render: Render) {
  Events.on(engine, "afterUpdate", emitPlayerPosition);

  function emitPlayerPosition() {
    // Emit the player position to the server
  }
}
