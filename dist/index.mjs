var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// src/mini-game/MiniGame.tsx
import { useMemo, useRef as useRef2, useState as useState2 } from "react";

// src/shared/useGameLoop.ts
import { useEffect, useRef } from "react";
function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
function useGameLoop(canvasRef, lifecycle, size, devicePixelRatio, onFrame) {
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const inputRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    action: false
  });
  useEffect(() => {
    function setKey(code, pressed) {
      switch (code) {
        case "ArrowLeft":
        case "KeyA":
          inputRef.current.left = pressed;
          break;
        case "ArrowRight":
        case "KeyD":
          inputRef.current.right = pressed;
          break;
        case "ArrowUp":
        case "KeyW":
          inputRef.current.up = pressed;
          break;
        case "ArrowDown":
        case "KeyS":
          inputRef.current.down = pressed;
          break;
        case "Space":
          inputRef.current.action = pressed;
          break;
      }
    }
    const onKeyDown = (e) => setKey(e.code, true);
    const onKeyUp = (e) => setKey(e.code, false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function setAction(pressed) {
      inputRef.current.action = pressed;
    }
    function onPointerDown(e) {
      setAction(true);
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width / 2) {
        inputRef.current.left = true;
        inputRef.current.right = false;
      } else {
        inputRef.current.right = true;
        inputRef.current.left = false;
      }
    }
    function onPointerUp() {
      setAction(false);
      inputRef.current.left = false;
      inputRef.current.right = false;
    }
    function onPointerCancel() {
      onPointerUp();
    }
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [canvasRef]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx = ctxMaybe;
    const backingW = Math.floor(size.w * devicePixelRatio);
    const backingH = Math.floor(size.h * devicePixelRatio);
    canvas.width = backingW;
    canvas.height = backingH;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    lifecycle.init(ctx, { w: size.w, h: size.h });
    lastTimeRef.current = now();
    function frame() {
      const t = now();
      const dt = Math.min(0.05, Math.max(0, (t - lastTimeRef.current) / 1e3));
      lastTimeRef.current = t;
      lifecycle.update(dt, inputRef.current);
      ctx.clearRect(0, 0, size.w, size.h);
      lifecycle.draw(ctx);
      onFrame == null ? void 0 : onFrame();
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef, lifecycle, size.w, size.h, devicePixelRatio, onFrame]);
}

// src/shared/useHighScore.ts
import { useEffect as useEffect2, useState } from "react";
function useHighScore(storageKey) {
  const [highScore, setHighScore] = useState(0);
  useEffect2(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw != null) {
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) setHighScore(parsed);
      }
    } catch (e) {
    }
  }, [storageKey]);
  function updateHighScore(latest) {
    if (!storageKey) return;
    setHighScore((prev) => {
      const next = Math.max(prev, latest);
      try {
        localStorage.setItem(storageKey, String(next));
      } catch (e) {
      }
      return next;
    });
  }
  return { highScore, updateHighScore };
}

// src/runtime/runnerGame.ts
function createRunner(base) {
  var _a, _b, _c;
  const gravity = 1600;
  const jumpVelocity = 650;
  const groundY = ((_a = base.height) != null ? _a : 180) - 24;
  let playerX = 40;
  let playerY = groundY;
  let playerVy = 0;
  let speed = 240;
  let elapsed = 0;
  let score = 0;
  let over = false;
  let obstacles = [];
  let width = (_b = base.width) != null ? _b : 320;
  let height = (_c = base.height) != null ? _c : 180;
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
      var _a2, _b2;
      if (over) return;
      elapsed += dt;
      speed = Math.min(520, speed + dt * 8);
      score += dt * (speed * 0.1);
      (_a2 = base.onScoreChange) == null ? void 0 : _a2.call(base, score);
      const wantsJump = input.up || input.action;
      if (wantsJump && playerY >= groundY - 0.5 || wantsJump && playerVy === 0) {
        playerVy = -jumpVelocity;
      }
      playerVy += gravity * dt;
      playerY += playerVy * dt;
      if (playerY > groundY) {
        playerY = groundY;
        playerVy = 0;
      }
      if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < width - 120) {
        if (Math.random() < 0.02 + Math.min(0.18, elapsed * 5e-3)) spawnObstacle();
      }
      obstacles.forEach((o) => o.x -= speed * dt);
      obstacles = obstacles.filter((o) => o.x + o.w > -10);
      for (const o of obstacles) {
        const px = playerX;
        const py = playerY - 14;
        const pw = 18;
        const ph = 14;
        const collided = px < o.x + o.w && px + pw > o.x && py < o.y + o.h && py + ph > o.y;
        if (collided) {
          over = true;
          (_b2 = base.onGameOver) == null ? void 0 : _b2.call(base, Math.floor(score));
          break;
        }
      }
    },
    draw(ctx) {
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(0, groundY + 1, width, height - groundY);
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(playerX, playerY - 14, 18, 14);
      ctx.fillStyle = "#f87171";
      for (const o of obstacles) {
        ctx.fillRect(o.x, o.y, o.w, o.h);
      }
      ctx.fillStyle = "#3a3a3a";
      for (let i = 0; i < 8; i++) {
        const x = (i * 60 - elapsed * speed % 60 + width) % width;
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
    }
  };
}

// src/runtime/paddleGame.ts
function createPaddle(base) {
  var _a, _b;
  let width = (_a = base.width) != null ? _a : 320;
  let height = (_b = base.height) != null ? _b : 180;
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
  let blocks = [];
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
      var _a2, _b2, _c;
      if (over) return;
      if (input.left) paddleX -= paddleSpeed * dt;
      if (input.right) paddleX += paddleSpeed * dt;
      paddleX = Math.max(0, Math.min(width - paddleW, paddleX));
      ballX += ballVx * dt;
      ballY += ballVy * dt;
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
      const withinPaddleX = ballX > paddleX && ballX < paddleX + paddleW;
      const hittingPaddle = withinPaddleX && ballY > paddleY - ballR && ballY < paddleY + paddleH;
      if (hittingPaddle) {
        ballY = paddleY - ballR;
        ballVy = -Math.abs(ballVy);
        const hitOffset = (ballX - (paddleX + paddleW / 2)) / (paddleW / 2);
        ballVx += hitOffset * 60;
      }
      for (const b of blocks) {
        if (!b.alive) continue;
        const closestX = Math.max(b.x, Math.min(ballX, b.x + b.w));
        const closestY = Math.max(b.y, Math.min(ballY, b.y + b.h));
        const dx = ballX - closestX;
        const dy = ballY - closestY;
        if (dx * dx + dy * dy < ballR * ballR) {
          b.alive = false;
          score += 10;
          (_a2 = base.onScoreChange) == null ? void 0 : _a2.call(base, score);
          if (Math.abs(dx) > Math.abs(dy)) ballVx *= -1;
          else ballVy *= -1;
          break;
        }
      }
      if (ballY > height + ballR * 4) {
        over = true;
        (_b2 = base.onGameOver) == null ? void 0 : _b2.call(base, score);
      }
      if (!blocks.some((b) => b.alive)) {
        over = true;
        (_c = base.onGameOver) == null ? void 0 : _c.call(base, score + 100);
      }
    },
    draw(ctx) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, width, height);
      for (const b of blocks) {
        if (!b.alive) continue;
        ctx.fillStyle = "#60a5fa";
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(paddleX, paddleY, paddleW, paddleH);
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
    }
  };
}

// src/mini-game/MiniGame.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function pickGame(name, baseProps) {
  switch (name) {
    case "runner":
      return createRunner(baseProps);
    case "paddle":
      return createPaddle(baseProps);
  }
}
function MiniGame(props) {
  const {
    game,
    width = 320,
    height = 180,
    devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    highScoreKey,
    style,
    className,
    title,
    showHud = true,
    showControlsHint = true,
    onGameOver,
    onScoreChange
  } = props;
  const canvasRef = useRef2(null);
  const [score, setScore] = useState2(0);
  const [isOver, setIsOver] = useState2(false);
  const { highScore, updateHighScore } = useHighScore(highScoreKey);
  const lifecycle = useMemo(() => {
    const base = {
      width,
      height,
      devicePixelRatio,
      onGameOver: (s) => {
        setIsOver(true);
        onGameOver == null ? void 0 : onGameOver(s);
        updateHighScore(s);
      },
      onScoreChange: (s) => {
        setScore(s);
        onScoreChange == null ? void 0 : onScoreChange(s);
      },
      highScoreKey
    };
    return pickGame(game, base);
  }, [game, width, height, devicePixelRatio, highScoreKey]);
  useGameLoop(
    canvasRef,
    lifecycle,
    { w: width, h: height },
    devicePixelRatio
  );
  function handleReset() {
    lifecycle.reset();
    setIsOver(false);
    setScore(0);
  }
  return /* @__PURE__ */ jsxs("div", { style: __spreadValues({ display: "inline-block" }, style), className, children: [
    title ? /* @__PURE__ */ jsx("div", { style: { fontFamily: "system-ui, sans-serif", marginBottom: 8 }, children: title }) : null,
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          position: "relative",
          width,
          height,
          userSelect: "none",
          touchAction: "none",
          background: "#111",
          borderRadius: 8,
          overflow: "hidden"
        },
        children: [
          /* @__PURE__ */ jsx("canvas", { ref: canvasRef }),
          showHud ? /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                position: "absolute",
                top: 6,
                left: 8,
                right: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#fff",
                fontFamily: "system-ui, sans-serif",
                fontSize: 12,
                opacity: 0.9
              },
              children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  "Score: ",
                  Math.floor(score)
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  "High: ",
                  Math.floor(highScore)
                ] })
              ]
            }
          ) : null,
          showControlsHint ? /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                position: "absolute",
                bottom: 6,
                left: 8,
                right: 8,
                color: "#ddd",
                fontFamily: "system-ui, sans-serif",
                fontSize: 11,
                textAlign: "center",
                opacity: 0.7
              },
              children: "Arrow keys or tap"
            }
          ) : null,
          isOver ? /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: "system-ui, sans-serif",
                flexDirection: "column",
                gap: 8
              },
              children: [
                /* @__PURE__ */ jsx("div", { style: { fontWeight: 600 }, children: "Game Over" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleReset,
                    style: {
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #666",
                      background: "#222",
                      color: "#fff",
                      cursor: "pointer"
                    },
                    children: "Reset"
                  }
                )
              ]
            }
          ) : null
        ]
      }
    )
  ] });
}

// src/games/Runner.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function Runner(props) {
  const _a = props, { title = "Runner" } = _a, rest = __objRest(_a, ["title"]);
  return /* @__PURE__ */ jsx2(MiniGame, __spreadValues({ game: "runner", title }, rest));
}

// src/games/Paddle.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
function Paddle(props) {
  const _a = props, { title = "Paddle" } = _a, rest = __objRest(_a, ["title"]);
  return /* @__PURE__ */ jsx3(MiniGame, __spreadValues({ game: "paddle", title }, rest));
}
export {
  MiniGame,
  Paddle,
  Runner
};
//# sourceMappingURL=index.mjs.map