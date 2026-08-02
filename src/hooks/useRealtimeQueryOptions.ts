'use client';

import { useRealtimeChannel } from './useRealtimeChannel';

/** Shared polling-as-realtime-fallback options for React Query. When the socket gateway
 *  is reachable, polling turns off entirely and useRealtimeInvalidate's push events do
 *  the refetching instead. */
export function useRealtimeQueryOptions() {
  const { mode } = useRealtimeChannel();
  return {
    refetchInterval: mode === 'socket' ? false : 4000,
    refetchIntervalInBackground: false,
  } as const;
}
