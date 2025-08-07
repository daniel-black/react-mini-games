import type { BaseGameProps, GameLifecycle } from "../shared/types";

export function createPaddle(base: BaseGameProps): GameLifecycle {
  let width = base.width ?? 320;
  let height = base.height ?? 180;

  const paddleW = 48;
  const paddleH = 8;
  let paddleX = width / 2 - paddleW / 2;
  const paddleY = height - 16;
  const paddleSpeed = 360;

  const ballR = 4;
  let ballX = width / 2;
  let ballY = height / 2;
  let ballVx = 160;
  let ballVy = -180;

  let blocks: { x: number; y: number; w: number; h: number; alive: boolean }[] =
    [];
  let score = 0;
  let over = false;

  function resetInternal() {
    paddleX = width / 2 - paddleW / 2;
    ballX = width / 2;
    ballY = height / 2;
    ballVx = 160 * (Math.random() > 0.5 ? 1 : -1);
    ballVy = -180;
    score = 0;
    over = false;
    blocks = [];
    const rows = 4;
    const cols = 8;
    const gap = 4;
    const bw = Math.floor((width - gap * (cols + 1)) / cols);
    const bh = 12;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gap + c * (bw + gap);
        const y = 24 + r * (bh + gap);
        blocks.push({ x, y, w: bw, h: bh, alive: true });
      }
    }
  }

  return {
    init(_ctx, size) {
      width = size.w;
      height = size.h;
      resetInternal();
    },
    update(dt, input) {
      if (over) return;

      if (input.left) paddleX -= paddleSpeed * dt;
      if (input.right) paddleX += paddleSpeed * dt;
      paddleX = Math.max(0, Math.min(width - paddleW, paddleX));

      ballX += ballVx * dt;
      ballY += ballVy * dt;

      // walls
      if (ballX < ballR) {
        ballX = ballR;
        ballVx = Math.abs(ballVx);
      } else if (ballX > width - ballR) {
        ballX = width - ballR;
        ballVx = -Math.abs(ballVx);
      }
      if (ballY < ballR) {
        ballY = ballR;
        ballVy = Math.abs(ballVy);
      }

      // paddle collision
      const withinPaddleX = ballX > paddleX && ballX < paddleX + paddleW;
      const hittingPaddle =
        withinPaddleX && ballY > paddleY - ballR && ballY < paddleY + paddleH;
      if (hittingPaddle) {
        ballY = paddleY - ballR;
        ballVy = -Math.abs(ballVy);
        // add some english based on hit offset
        const hitOffset = (ballX - (paddleX + paddleW / 2)) / (paddleW / 2);
        ballVx += hitOffset * 60;
      }

      // block collisions (AABB vs circle approx)
      for (const b of blocks) {
        if (!b.alive) continue;
        const closestX = Math.max(b.x, Math.min(ballX, b.x + b.w));
        const closestY = Math.max(b.y, Math.min(ballY, b.y + b.h));
        const dx = ballX - closestX;
        const dy = ballY - closestY;
        if (dx * dx + dy * dy < ballR * ballR) {
          b.alive = false;
          score += 10;
          base.onScoreChange?.(score);
          // reflect
          if (Math.abs(dx) > Math.abs(dy)) ballVx *= -1;
          else ballVy *= -1;
          break;
        }
      }

      // lose condition
      if (ballY > height + ballR * 4) {
        over = true;
        base.onGameOver?.(score);
      }

      // win condition
      if (!blocks.some((b) => b.alive)) {
        over = true;
        base.onGameOver?.(score + 100);
      }
    },
    draw(ctx) {
      // background
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, width, height);

      // blocks
      for (const b of blocks) {
        if (!b.alive) continue;
        ctx.fillStyle = "#60a5fa";
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }

      // paddle
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(paddleX, paddleY, paddleW, paddleH);

      // ball
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
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
