import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

type BaseGameProps = {
    width?: number;
    height?: number;
    devicePixelRatio?: number;
    onGameOver?: (score: number) => void;
    onScoreChange?: (score: number) => void;
    highScoreKey?: string;
    style?: React.CSSProperties;
    className?: string;
};

type MiniGameName = "runner" | "paddle";
type MiniGameProps = BaseGameProps & {
    game: MiniGameName;
    title?: string;
    showHud?: boolean;
    showControlsHint?: boolean;
};

declare function MiniGame(props: MiniGameProps): react_jsx_runtime.JSX.Element;

type RunnerProps = BaseGameProps & {
    title?: string;
};
declare function Runner(props: RunnerProps): react_jsx_runtime.JSX.Element;

type PaddleProps = BaseGameProps & {
    title?: string;
};
declare function Paddle(props: PaddleProps): react_jsx_runtime.JSX.Element;

export { type BaseGameProps, MiniGame, type MiniGameName, type MiniGameProps, Paddle, type PaddleProps, Runner, type RunnerProps };
