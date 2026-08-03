'use client';

import { useEffect, useState } from 'react';

// Minutes elapsed since a timestamp, ticking every 15s — used for admin queue
// "how long has this been waiting" displays (counts up, unlike useCountdown which
// counts down to an estimated finish time).
export function useElapsedMinutes(since: string): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  return Math.max(0, Math.floor((now - new Date(since).getTime()) / 60_000));
}
