import type { BaseGameProps, GameLifecycle, InputState } from "../shared/types";

type Cell = { x: number; y: number };

export function createSnake(base: BaseGameProps): GameLifecycle {
  let width = base.width ?? 320;
  let height = base.height ?? 180;

  const cols = 20;
  const rows = 12;
  let cellSize = Math.floor(Math.min(width / cols, height / rows));
  function toPx(n: number) {
    return n * cellSize;
  }

  let snake: Cell[] = [];
  let dir: Cell = { x: 1, y: 0 };
  let food: Cell = { x: 10, y: 6 };
  let timeAcc = 0;
  let stepTime = 0.12; // seconds per step
  let score = 0;
  let over = false;

  function resetInternal() {
    cellSize = Math.floor(Math.min(width / cols, height / rows));
    snake = [
      { x: 4, y: 6 },
      { x: 3, y: 6 },
      { x: 2, y: 6 },
    ];
    dir = { x: 1, y: 0 };
    food = randomEmptyCell();
    timeAcc = 0;
    stepTime = 0.12;
    score = 0;
    over = false;
  }

  function randomEmptyCell(): Cell {
    while (true) {
      const c = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
      if (!snake.some((s) => s.x === c.x && s.y === c.y)) return c;
    }
  }

  function handleInput(input: InputState) {
    if (input.left && dir.x !== 1) dir = { x: -1, y: 0 };
    else if (input.right && dir.x !== -1) dir = { x: 1, y: 0 };
    else if (input.up && dir.y !== 1) dir = { x: 0, y: -1 };
    else if (input.down && dir.y !== -1) dir = { x: 0, y: 1 };
  }

  return {
    init(_ctx, size) {
      width = size.w;
      height = size.h;
      resetInternal();
    },
    update(dt, input) {
      if (over) return;
      handleInput(input);
      timeAcc += dt;
      if (timeAcc < stepTime) return;
      timeAcc = 0;

      const nextHead = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      // wall collision
      if (
        nextHead.x < 0 ||
        nextHead.x >= cols ||
        nextHead.y < 0 ||
        nextHead.y >= rows
      ) {
        over = true;
        base.onGameOver?.(score);
        return;
      }
      // self collision
      if (snake.some((s) => s.x === nextHead.x && s.y === nextHead.y)) {
        over = true;
        base.onGameOver?.(score);
        return;
      }

      snake.unshift(nextHead);
      if (nextHead.x === food.x && nextHead.y === food.y) {
        score += 10;
        base.onScoreChange?.(score);
        food = randomEmptyCell();
        stepTime = Math.max(0.06, stepTime - 0.002);
      } else {
        snake.pop();
      }
    },
    draw(ctx) {
      // background
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, width, height);

      // grid (subtle)
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 1;
      for (let c = 1; c < cols; c++) {
        ctx.beginPath();
        ctx.moveTo(toPx(c) + 0.5, 0);
        ctx.lineTo(toPx(c) + 0.5, toPx(rows));
        ctx.stroke();
      }
      for (let r = 1; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, toPx(r) + 0.5);
        ctx.lineTo(toPx(cols), toPx(r) + 0.5);
        ctx.stroke();
      }

      // food
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(
        toPx(food.x) + 2,
        toPx(food.y) + 2,
        cellSize - 4,
        cellSize - 4
      );

      // snake
      for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "#22d3ee" : "#0ea5e9";
        const s = snake[i];
        ctx.fillRect(toPx(s.x) + 1, toPx(s.y) + 1, cellSize - 2, cellSize - 2);
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
