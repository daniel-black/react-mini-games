import { MiniGame } from "../mini-game/MiniGame";
import type { BaseGameProps } from "../shared/types";

export type AsteroidsProps = BaseGameProps & { title?: string };

export function Asteroids(props: AsteroidsProps) {
  const { title = "Asteroids", ...rest } = props;
  return <MiniGame game="asteroids" title={title} {...rest} />;
}
