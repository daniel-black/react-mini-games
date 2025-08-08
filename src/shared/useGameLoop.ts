import { useEffect, useRef } from "react";
import type { GameLifecycle, InputState } from "./types";

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  lifecycle: GameLifecycle,
  size: { w: number; h: number },
  devicePixelRatio: number,
  onFrame?: () => void
) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    action: false,
  });

  // Input listeners
  useEffect(() => {
    function setKey(code: string, pressed: boolean) {
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

    const onKeyDown = (e: KeyboardEvent) => setKey(e.code, true);
    const onKeyUp = (e: KeyboardEvent) => setKey(e.code, false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Touch/mouse as a generic action or directional input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function setAction(pressed: boolean) {
      inputRef.current.action = pressed;
    }

    function onPointerDown(e: PointerEvent) {
      setAction(true);
      const rect = canvas!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      inputRef.current.left = x < midX;
      inputRef.current.right = x >= midX;
      inputRef.current.up = y < midY;
      inputRef.current.down = y >= midY;
    }
    function onPointerUp() {
      setAction(false);
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.up = false;
      inputRef.current.down = false;
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

  // Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx = ctxMaybe as CanvasRenderingContext2D;

    // Resize backing store for crisp rendering
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
      const dt = Math.min(0.05, Math.max(0, (t - lastTimeRef.current) / 1000));
      lastTimeRef.current = t;

      lifecycle.update(dt, inputRef.current);
      ctx.clearRect(0, 0, size.w, size.h);
      lifecycle.draw(ctx);

      onFrame?.();
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef, lifecycle, size.w, size.h, devicePixelRatio, onFrame]);
}
