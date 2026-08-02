'use client';

import { useEffect, useState } from 'react';
import { getRealtimeMode, type RealtimeMode } from '@/lib/realtime';

/** Resolves the one shared connection attempt for this tab (see getRealtimeMode) — safe
 *  to call from as many components/hooks as needed. Starts 'connecting' so consumers can
 *  avoid flashing a 4s polling interval before the attempt settles. */
export function useRealtimeChannel() {
  const [mode, setMode] = useState<RealtimeMode | 'connecting'>('connecting');

  useEffect(() => {
    let cancelled = false;
    getRealtimeMode().then((resolved) => {
      if (!cancelled) setMode(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { mode };
}
