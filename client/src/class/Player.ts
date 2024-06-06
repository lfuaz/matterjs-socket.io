import { Body, World } from "matter-js";
import { Ground } from "./Ground";

export class Player {
  id: string;
  body: Body;
  ground: Ground;
  isGrounded: boolean;

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    world: World,
    windowWidth: number,
    windowHeight: number,
    friction: number,
    restitution: number,
    angle: number,
    color: string,
    ground: Ground
  ) {
    this.body = Body.create({
      position: { x, y },
      angle,
      friction,
      restitution,
      area: width * height,
      render: {
        fillStyle: color,
      },
    });
    World.add(world, this.body);
    this.id = id;
    this.isGrounded = false;
    this.ground = ground; // Store ground object
  }

  moveLeft() {
    Body.applyForce(this.body, this.body.position, { x: -0.05, y: 0 });
  }

  moveRight() {
    Body.applyForce(this.body, this.body.position, { x: 0.05, y: 0 });
  }

  jump() {
    if (this.isGrounded) {
      Body.applyForce(this.body, this.body.position, { x: 0, y: -0.1 });
      this.isGrounded = false;
    }
  }

  update() {
    // Implement the update logic using this.ground
  }
}
