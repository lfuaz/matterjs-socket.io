import { Bodies, Body, World } from "matter-js";

export class Ground {
  body: Body;
  width: number;
  height: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    world: World
  ) {
    this.width = width;
    this.height = height;
    this.body = Bodies.rectangle(x, y, this.width, this.height, {
      isStatic: true,
    });
    World.add(world, this.body);
  }

  updatePositionAndSize(x: number, y: number, width: number, height: number) {
    Body.setPosition(this.body, { x, y });
    Body.scale(this.body, width / this.width, height / this.height);
    this.width = width;
    this.height = height;
  }
}
