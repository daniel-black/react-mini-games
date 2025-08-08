import { MiniGame } from "../mini-game/MiniGame";
import type { BaseGameProps } from "../shared/types";

export type SnakeProps = BaseGameProps & { title?: string };

export function Snake(props: SnakeProps) {
  const { title = "Snake", ...rest } = props;
  return <MiniGame game="snake" title={title} {...rest} />;
}
