# react-mini-games

A zero-dependency collection of tiny, fun canvas games for React. Great for 404 pages or playful embeds.

- Zero runtime dependencies (React is a peer dependency)
- Keyboard and touch controls
- Retina/crisp canvas scaling
- Built-in HUD, game over overlay, reset, score/high score callbacks

## Install

```bash
npm i react-mini-games
```

## Usage

```tsx
import {
  MiniGame,
  Runner,
  Paddle,
  Flappy,
  Snake,
  Asteroids,
} from "react-mini-games";

export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <MiniGame
        game="runner"
        width={360}
        height={200}
        highScoreKey="runner-hs"
      />
      {/* or individual exports */}
      <Runner width={360} height={200} />
      <Paddle width={360} height={220} />
      <Flappy width={360} height={200} />
      <Snake width={360} height={200} />
      <Asteroids width={360} height={200} />
    </div>
  );
}
```

### Common props

- `width`, `height` (default 320x180)
- `devicePixelRatio` (defaults to `window.devicePixelRatio`)
- `onGameOver(score)`, `onScoreChange(score)`
- `highScoreKey` (enables localStorage high score)
- `title`, `showHud`, `showControlsHint`, `style`, `className`

### Controls

- Desktop: Arrow keys/WASD, Space
- Mobile: Tap; left/right side controls when relevant

## Games

- `runner`: Endless runner with obstacles
- `paddle`: Breakout-style paddle + blocks
- `flappy`: Tap/space to flap through gaps
- `snake`: Grid movement, eat food, grow
- `asteroids`: Rotate/thrust, shoot and split rocks

## Develop

```bash
npm i
npm run type-check
npm run lint
npm run build
npm run dev
```

### Try locally in another app

```bash
npm run build
npm pack  # produces react-mini-games-x.y.z.tgz
# in your app
npm i /absolute/path/to/react-mini-games-x.y.z.tgz
```

## Publish

```bash
npm whoami || npm login
npm publish --access public
```

### Update version

```bash
npm version patch   # or minor / major
npm publish
```

### Pre-release

```bash
npm version prerelease --preid=beta
npm publish --tag beta
```

## License

MIT © Daniel Black
