'use client';

import { useEffect, useState } from 'react';

// mm:ss remaining from startedAt + estimatedMinutes, ticking every second.
export function useCountdown(startedAt: string | null, estimatedMinutes: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const endAt = startedAt
    ? new Date(startedAt).getTime() + estimatedMinutes * 60_000
    : now + estimatedMinutes * 60_000;
  const remainingSeconds = Math.max(0, Math.floor((endAt - now) / 1000));
  const done = startedAt !== null && remainingSeconds === 0;

  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const ss = String(remainingSeconds % 60).padStart(2, '0');

  return { remainingSeconds, label: `${mm}:${ss}`, done };
}
