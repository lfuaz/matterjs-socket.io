import {
  Bodies,
  Body,
  Composite,
  World,
  Vector,
  Collision,
  Render,
} from "matter-js";
import { Ground } from "./Ground";

const GRAVITY = 0.5;
const FRICTION = 0.9;

export class Player {
  body: Body;
  isGrounded: Boolean;
  speed: number;
  jumpForce: number;
  canvasWidth: number;
  canvasHeight: number;
  angle: number;
  color: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    world: World,
    canvasWidth: number,
    canvasHeight: number,
    speed: number = 0.008,
    jumpForce: number = 0.1,
    angle: number = 0,
    color: string = "#eee"
  ) {
    this.color = color;
    this.body = Bodies.rectangle(x, y, width, height, {
      restitution: 0.2,
      render: { fillStyle: this.color },
    });
    this.isGrounded = false;
    this.speed = speed;
    this.jumpForce = jumpForce;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.angle = angle;

    Body.setAngle(this.body, this.angle);
    Composite.add(world, this.body);
  }

  moveLeft() {
    const force = Vector.create(-this.speed, 0);
    Body.applyForce(this.body, this.body.position, force);
  }

  moveRight() {
    const force = Vector.create(this.speed, 0);
    Body.applyForce(this.body, this.body.position, force);
  }

  jump(ground: Ground) {
    this.isGrounded = this.checkIfGrounded(ground);

    if (this.isGrounded) {
      const force = Vector.create(0, -this.jumpForce);
      Body.applyForce(this.body, this.body.position, force);
      this.isGrounded = false; // Set to false after a jump
    }
  }

  update(ground: Ground) {
    // Check if the player is on the ground before applying gravity
    this.isGrounded = this.checkIfGrounded(ground);

    this.applyGravity();
    this.applyFriction();

    // Handle wrapping around the canvas
    this.handleCanvasWrap();

    // Update player's position using velocity
    // This line is not needed as Matter.js handles the update internally
    // const newPosition = Vector.add(this.body.position, this.body.velocity);
    // Body.setPosition(this.body, newPosition);
  }

  applyGravity() {
    if (!this.isGrounded) {
      const newVelocity = Vector.add(
        this.body.velocity,
        Vector.create(0, GRAVITY)
      );
      Body.setVelocity(this.body, newVelocity);
    }
  }

  applyFriction() {
    if (this.isGrounded) {
      const newVelocity = Vector.create(
        this.body.velocity.x * FRICTION,
        this.body.velocity.y
      );
      Body.setVelocity(this.body, newVelocity);
    }
  }

  checkIfGrounded(ground: Ground) {
    // Use Collision to check if the player is touching the ground
    const playerBounds = this.body;
    const groundBounds = ground.body;

    const isColliding =
      Collision.collides(playerBounds, groundBounds)?.collided ?? false;

    return isColliding;
  }

  handleCanvasWrap() {
    let newPosition = this.body.position;

    if (this.body.position.x < 0) {
      newPosition = Vector.create(
        this.canvasWidth + this.body.position.x,
        this.body.position.y
      );
    } else if (this.body.position.x > this.canvasWidth) {
      newPosition = Vector.create(
        this.body.position.x - this.canvasWidth,
        this.body.position.y
      );
    }
    Body.setPosition(this.body, newPosition);
  }

  draw(render: Render) {
    const ctx = render.context;
    const x = this.body.position.x;
    const y = this.body.position.y;
    const { min, max } = this.body.bounds;
    ctx.fillStyle = "blue"; // Or any other distinguishing color
    ctx.fillRect(min.x, min.y, max.x - min.x, max.y - min.y);
  }
}
