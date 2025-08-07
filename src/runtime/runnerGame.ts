import type { BaseGameProps, GameLifecycle } from "../shared/types";

type Obstacle = { x: number; y: number; w: number; h: number };

export function createRunner(base: BaseGameProps): GameLifecycle {
  const gravity = 1600; // px/s^2
  const jumpVelocity = 650; // px/s
  const groundY = (base.height ?? 180) - 24;

  let playerX = 40;
  let playerY = groundY;
  let playerVy = 0;
  let speed = 240; // world speed px/s
  let elapsed = 0;
  let score = 0;
  let over = false;
  let obstacles: Obstacle[] = [];
  let width = base.width ?? 320;
  let height = base.height ?? 180;

  function resetInternal() {
    playerX = 40;
    playerY = groundY;
    playerVy = 0;
    speed = 240;
    elapsed = 0;
    score = 0;
    over = false;
    obstacles = [];
  }

  function spawnObstacle() {
    const size = 12 + Math.random() * 18;
    const h = size;
    const w = size;
    obstacles.push({ x: width + w, y: groundY - h + 2, w, h });
  }

  return {
    init(_ctx, size) {
      width = size.w;
      height = size.h;
      resetInternal();
    },
    update(dt, input) {
      if (over) return;

      elapsed += dt;
      speed = Math.min(520, speed + dt * 8); // gradual difficulty
      score += dt * (speed * 0.1);
      base.onScoreChange?.(score);

      // input: jump
      const wantsJump = input.up || input.action;
      if (
        (wantsJump && playerY >= groundY - 0.5) ||
        (wantsJump && playerVy === 0)
      ) {
        playerVy = -jumpVelocity;
      }

      // physics
      playerVy += gravity * dt;
      playerY += playerVy * dt;
      if (playerY > groundY) {
        playerY = groundY;
        playerVy = 0;
      }

      // obstacles spawn
      if (
        obstacles.length === 0 ||
        obstacles[obstacles.length - 1].x < width - 120
      ) {
        if (Math.random() < 0.02 + Math.min(0.18, elapsed * 0.005))
          spawnObstacle();
      }

      // move obstacles
      obstacles.forEach((o) => (o.x -= speed * dt));
      obstacles = obstacles.filter((o) => o.x + o.w > -10);

      // collisions
      for (const o of obstacles) {
        const px = playerX;
        const py = playerY - 14;
        const pw = 18;
        const ph = 14;
        const collided =
          px < o.x + o.w && px + pw > o.x && py < o.y + o.h && py + ph > o.y;
        if (collided) {
          over = true;
          base.onGameOver?.(Math.floor(score));
          break;
        }
      }
    },
    draw(ctx) {
      // ground
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(0, groundY + 1, width, height - groundY);

      // player
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(playerX, playerY - 14, 18, 14);

      // obstacles
      ctx.fillStyle = "#f87171";
      for (const o of obstacles) {
        ctx.fillRect(o.x, o.y, o.w, o.h);
      }

      // parallax dashes
      ctx.fillStyle = "#3a3a3a";
      for (let i = 0; i < 8; i++) {
        const x = (i * 60 - ((elapsed * speed) % 60) + width) % width;
        ctx.fillRect(x, groundY - 20, 24, 2);
      }
    },
    reset() {
      resetInternal();
    },
    getScore() {
      return Math.floor(score);
    },
    isGameOver() {
      return over;
    },
  };
}
