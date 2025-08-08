import type { BaseGameProps, GameLifecycle, InputState } from "../shared/types";

type Pipe = { x: number; gapY: number; gapH: number; w: number };

export function createFlappy(base: BaseGameProps): GameLifecycle {
  let width = base.width ?? 320;
  let height = base.height ?? 180;

  const gravity = 900;
  const flapVy = -280;
  const pipeSpeed = 120;
  const pipeEvery = 1.4; // seconds
  const birdX = width * 0.28;
  const gapH = 56;

  let birdY = height / 2;
  let birdVy = 0;
  let pipes: Pipe[] = [];
  let timeSincePipe = 0;
  let score = 0;
  let over = false;

  function resetInternal() {
    birdY = height / 2;
    birdVy = 0;
    pipes = [];
    timeSincePipe = 0;
    score = 0;
    over = false;
  }

  function spawnPipe() {
    const m = 30;
    const gapY = m + Math.random() * (height - m * 2 - gapH);
    pipes.push({ x: width + 20, gapY, gapH, w: 26 });
  }

  function wantsFlap(input: InputState) {
    return input.action || input.up;
  }

  return {
    init(_ctx, size) {
      width = size.w;
      height = size.h;
      resetInternal();
    },
    update(dt, input) {
      if (over) return;

      if (wantsFlap(input)) {
        birdVy = flapVy;
      }
      birdVy += gravity * dt;
      birdY += birdVy * dt;

      // spawn pipes
      timeSincePipe += dt;
      if (timeSincePipe >= pipeEvery) {
        timeSincePipe = 0;
        spawnPipe();
      }

      // move pipes
      pipes.forEach((p) => (p.x -= pipeSpeed * dt));
      pipes = pipes.filter((p) => p.x + p.w > -10);

      // score: passed pipes
      for (const p of pipes) {
        if (!over && p.x + p.w < birdX && p.x + p.w >= birdX - pipeSpeed * dt) {
          score += 1;
          base.onScoreChange?.(score);
        }
      }

      // collisions
      const birdR = 6;
      if (birdY - birdR < 0 || birdY + birdR > height) {
        over = true;
        base.onGameOver?.(score);
        return;
      }
      for (const p of pipes) {
        const inPipeX = birdX + birdR > p.x && birdX - birdR < p.x + p.w;
        const inGapY =
          birdY - birdR > p.gapY && birdY + birdR < p.gapY + p.gapH;
        if (inPipeX && !inGapY) {
          over = true;
          base.onGameOver?.(score);
          break;
        }
      }
    },
    draw(ctx) {
      // bg
      ctx.fillStyle = "#0d1323";
      ctx.fillRect(0, 0, width, height);

      // pipes
      ctx.fillStyle = "#22c55e";
      for (const p of pipes) {
        ctx.fillRect(p.x, 0, p.w, p.gapY);
        ctx.fillRect(p.x, p.gapY + p.gapH, p.w, height - (p.gapY + p.gapH));
      }

      // ground line
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, height - 2, width, 2);

      // bird
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(birdX, birdY, 6, 0, Math.PI * 2);
      ctx.fill();
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
