import { MiniGame } from "../mini-game/MiniGame";
import type { BaseGameProps } from "../shared/types";

export type FlappyProps = BaseGameProps & { title?: string };

export function Flappy(props: FlappyProps) {
  const { title = "Flappy", ...rest } = props;
  return <MiniGame game="flappy" title={title} {...rest} />;
}
