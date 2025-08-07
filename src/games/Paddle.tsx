import type { BaseGameProps } from "../shared/types";
import { MiniGame } from "../mini-game/MiniGame";

export type PaddleProps = BaseGameProps & {
  title?: string;
};

export function Paddle(props: PaddleProps) {
  const { title = "Paddle", ...rest } = props;
  return <MiniGame game="paddle" title={title} {...rest} />;
}
