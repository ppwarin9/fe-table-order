'use client';

import { useEffect } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useRealtimeChannel } from './useRealtimeChannel';
import { getSocket } from '@/lib/realtime';
import type { RTEventType } from '@/lib/realtime/events';
import type { ID } from '@/lib/types/common';

/**
 * Event-driven half of the realtime story — joins the backend's per-table-session room
 * ('join' with tableSessionId) or the admin room ('join-admin'), and invalidates the given
 * query whenever any of `events` fires. Each RTEventType arrives as its own bare socket
 * event (no envelope) — matches src/realtime/realtime.gateway.ts on the backend exactly.
 *
 * @param tableSessionId `null` subscribes to the admin room instead of a per-table one.
 */
export function useRealtimeInvalidate(
  tableSessionId: ID | null,
  events: RTEventType[],
  queryKey: QueryKey,
) {
  const { mode } = useRealtimeChannel();
  const queryClient = useQueryClient();
  const eventsKey = events.join(',');
  const queryKeyString = JSON.stringify(queryKey);

  useEffect(() => {
    if (mode !== 'socket') return;
    const socket = getSocket();
    if (!socket) return;

    if (tableSessionId) {
      socket.emit('join', tableSessionId);
    } else {
      socket.emit('join-admin');
    }

    const handler = () => queryClient.invalidateQueries({ queryKey: JSON.parse(queryKeyString) });
    const eventList = eventsKey.split(',') as RTEventType[];
    eventList.forEach((evt) => socket.on(evt, handler));

    return () => {
      eventList.forEach((evt) => socket.off(evt, handler));
    };
  }, [mode, tableSessionId, eventsKey, queryKeyString, queryClient]);
}
