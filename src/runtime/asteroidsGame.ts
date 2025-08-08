import type { BaseGameProps, GameLifecycle, InputState } from "../shared/types";

type Asteroid = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alive: boolean;
};
type Bullet = { x: number; y: number; vx: number; vy: number; life: number };

export function createAsteroids(base: BaseGameProps): GameLifecycle {
  let width = base.width ?? 320;
  let height = base.height ?? 180;

  const ship = {
    x: width / 2,
    y: height / 2,
    angle: -Math.PI / 2,
    vx: 0,
    vy: 0,
  };
  const thrust = 80;
  const turnSpeed = 3.2; // rad/s
  const friction = 0.995;

  let asteroids: Asteroid[] = [];
  let bullets: Bullet[] = [];
  let score = 0;
  let over = false;

  function resetInternal() {
    ship.x = width / 2;
    ship.y = height / 2;
    ship.vx = 0;
    ship.vy = 0;
    ship.angle = -Math.PI / 2;
    asteroids = [];
    bullets = [];
    score = 0;
    over = false;
    for (let i = 0; i < 6; i++) spawnAsteroid(24 + Math.random() * 10);
  }

  function spawnAsteroid(r: number, x?: number, y?: number) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 40;
    const px = x ?? (Math.random() < 0.5 ? 0 : width);
    const py = y ?? Math.random() * height;
    asteroids.push({
      x: px,
      y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      alive: true,
    });
  }

  function wrap(ent: { x: number; y: number }) {
    if (ent.x < 0) ent.x += width;
    if (ent.x > width) ent.x -= width;
    if (ent.y < 0) ent.y += height;
    if (ent.y > height) ent.y -= height;
  }

  function fire() {
    const speed = 240;
    const vx = Math.cos(ship.angle) * speed + ship.vx;
    const vy = Math.sin(ship.angle) * speed + ship.vy;
    bullets.push({ x: ship.x, y: ship.y, vx, vy, life: 1.2 });
  }

  function handleInput(input: InputState, dt: number) {
    if (input.left) ship.angle -= turnSpeed * dt;
    if (input.right) ship.angle += turnSpeed * dt;
    if (input.up || input.action) {
      ship.vx += Math.cos(ship.angle) * thrust * dt;
      ship.vy += Math.sin(ship.angle) * thrust * dt;
    }
    // tap to fire on downward half for mobile
    if (input.down && input.action) fire();
  }

  return {
    init(_ctx, size) {
      width = size.w;
      height = size.h;
      resetInternal();
    },
    update(dt, input) {
      if (over) return;
      handleInput(input, dt);

      // physics
      ship.x += ship.vx * dt;
      ship.y += ship.vy * dt;
      ship.vx *= friction;
      ship.vy *= friction;
      wrap(ship);

      for (const b of bullets) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        wrap(b);
      }
      bullets = bullets.filter((b) => b.life > 0);

      for (const a of asteroids) {
        if (!a.alive) continue;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        wrap(a);
      }

      // collisions bullets vs asteroids
      for (const a of asteroids) {
        if (!a.alive) continue;
        for (const b of bullets) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (dx * dx + dy * dy < a.r * a.r) {
            a.alive = false;
            score += a.r >= 20 ? 20 : a.r >= 12 ? 10 : 5;
            base.onScoreChange?.(score);
            // split
            if (a.r > 12) {
              spawnAsteroid(a.r * 0.6, a.x, a.y);
              spawnAsteroid(a.r * 0.6, a.x, a.y);
            }
            b.life = 0;
            break;
          }
        }
      }
      asteroids = asteroids.filter((a) => a.alive);

      // asteroid vs ship
      for (const a of asteroids) {
        const dx = a.x - ship.x;
        const dy = a.y - ship.y;
        const shipR = 6;
        if (dx * dx + dy * dy < (a.r + shipR) * (a.r + shipR)) {
          over = true;
          base.onGameOver?.(score);
          break;
        }
      }

      // respawn asteroids as needed
      if (asteroids.length < 6) spawnAsteroid(20 + Math.random() * 14);
    },
    draw(ctx) {
      // background
      ctx.fillStyle = "#0b0f1a";
      ctx.fillRect(0, 0, width, height);

      // ship (triangle)
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.strokeStyle = "#a3e635";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // bullets
      ctx.fillStyle = "#eab308";
      for (const b of bullets) {
        ctx.fillRect(b.x - 1, b.y - 1, 2, 2);
      }

      // asteroids
      ctx.strokeStyle = "#94a3b8";
      for (const a of asteroids) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    reset() {
      resetInternal();
    },
    getScore() {
      return score;
    },
    isGameOver() {
      return over;
    },
  };
}
