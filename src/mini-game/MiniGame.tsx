import { useEffect, useMemo, useRef, useState } from "react";
import type { MiniGameProps, MiniGameName } from "./types";
import { useGameLoop } from "../shared/useGameLoop";
import { useHighScore } from "../shared/useHighScore";
import type { BaseGameProps, GameLifecycle } from "../shared/types";
import { createRunner } from "../runtime/runnerGame";
import { createPaddle } from "../runtime/paddleGame";
import { createFlappy } from "../runtime/flappyGame";
import { createSnake } from "../runtime/snakeGame";
import { createAsteroids } from "../runtime/asteroidsGame";

function pickGame(name: MiniGameName, baseProps: BaseGameProps): GameLifecycle {
  switch (name) {
    case "runner":
      return createRunner(baseProps);
    case "paddle":
      return createPaddle(baseProps);
    case "flappy":
      return createFlappy(baseProps);
    case "snake":
      return createSnake(baseProps);
    case "asteroids":
      return createAsteroids(baseProps);
  }
}

export function MiniGame(props: MiniGameProps) {
  const {
    game,
    width = 320,
    height = 180,
    devicePixelRatio = typeof window !== "undefined"
      ? window.devicePixelRatio || 1
      : 1,
    highScoreKey,
    style,
    className,
    title,
    showHud = true,
    showControlsHint = true,
    onGameOver,
    onScoreChange,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [isOver, setIsOver] = useState(false);
  const { highScore, updateHighScore } = useHighScore(highScoreKey);

  // Keep external callbacks in refs to avoid recreating the lifecycle
  const onGameOverRef = useRef(onGameOver);
  const onScoreChangeRef = useRef(onScoreChange);
  const updateHighScoreRef = useRef(updateHighScore);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    onScoreChangeRef.current = onScoreChange;
  }, [onScoreChange]);

  useEffect(() => {
    updateHighScoreRef.current = updateHighScore;
  }, [updateHighScore]);

  const lifecycle = useMemo(() => {
    const base: BaseGameProps = {
      width,
      height,
      devicePixelRatio,
      onGameOver: (s) => {
        setIsOver(true);
        onGameOverRef.current?.(s);
        updateHighScoreRef.current?.(s);
      },
      onScoreChange: (s) => {
        setScore(s);
        onScoreChangeRef.current?.(s);
      },
      highScoreKey,
    };
    return pickGame(game, base);
  }, [game, width, height, devicePixelRatio, highScoreKey]);

  useGameLoop(canvasRef, lifecycle, { w: width, h: height }, devicePixelRatio);

  function handleReset() {
    lifecycle.reset();
    setIsOver(false);
    setScore(0);
  }

  return (
    <div style={{ display: "inline-block", ...style }} className={className}>
      {title ? (
        <div style={{ fontFamily: "system-ui, sans-serif", marginBottom: 8 }}>
          {title}
        </div>
      ) : null}
      <div
        style={{
          position: "relative",
          width,
          height,
          userSelect: "none",
          touchAction: "none",
          background: "#111",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <canvas ref={canvasRef} />
        {showHud ? (
          <div
            style={{
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
              opacity: 0.9,
            }}
          >
            <div>Score: {Math.floor(score)}</div>
            <div>High: {Math.floor(highScore)}</div>
          </div>
        ) : null}

        {showControlsHint ? (
          <div
            style={{
              position: "absolute",
              bottom: 6,
              left: 8,
              right: 8,
              color: "#ddd",
              fontFamily: "system-ui, sans-serif",
              fontSize: 11,
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            Arrow keys or tap
          </div>
        ) : null}

        {isOver ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "system-ui, sans-serif",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 600 }}>Game Over</div>
            <button
              onClick={handleReset}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #666",
                background: "#222",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
