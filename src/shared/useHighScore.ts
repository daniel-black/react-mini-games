import { useEffect, useState } from "react";

export function useHighScore(storageKey?: string) {
  const [highScore, setHighScore] = useState<number>(0);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw != null) {
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) setHighScore(parsed);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  function updateHighScore(latest: number) {
    if (!storageKey) return;
    setHighScore((prev) => {
      const next = Math.max(prev, latest);
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return { highScore, updateHighScore } as const;
}
