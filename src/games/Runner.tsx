import type { BaseGameProps } from "../shared/types";
import { MiniGame } from "../mini-game/MiniGame";

export type RunnerProps = BaseGameProps & {
  title?: string;
};

export function Runner(props: RunnerProps) {
  const { title = "Runner", ...rest } = props;
  return <MiniGame game="runner" title={title} {...rest} />;
}
