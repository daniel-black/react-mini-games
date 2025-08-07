import type React from "react";

export type InputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  action: boolean; // space/tap
};

export type BaseGameProps = {
  width?: number; // canvas width in CSS pixels
  height?: number; // canvas height in CSS pixels
  devicePixelRatio?: number; // default 2 for crispness on retina
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
  highScoreKey?: string; // if provided, enable localStorage high score tracking
  style?: React.CSSProperties;
  className?: string;
};

export type GameLifecycle = {
  init: (ctx: CanvasRenderingContext2D, size: { w: number; h: number }) => void;
  update: (dt: number, input: InputState) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  reset: () => void;
  getScore: () => number;
  isGameOver: () => boolean;
};
