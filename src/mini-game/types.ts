import type { BaseGameProps } from "../shared/types";

export type MiniGameName = "runner" | "paddle";

export type MiniGameProps = BaseGameProps & {
  game: MiniGameName;
  title?: string;
  showHud?: boolean;
  showControlsHint?: boolean;
};
