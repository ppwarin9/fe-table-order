// One socket.io connection attempt per browser tab — every caller (useCart, useOrders,
// admin queue, etc.) awaits the SAME attempt instead of each opening its own socket.
// Resolves 'polling' if NEXT_PUBLIC_SOCKET_URL is unset or the handshake fails/times out,
// so query hooks always have a safe fallback regardless of backend/network state.
import { io, type Socket } from 'socket.io-client';
import { env } from '@/config/env';

export type RealtimeMode = 'socket' | 'polling';

let socket: Socket | null = null;
let modePromise: Promise<RealtimeMode> | null = null;

export function getRealtimeMode(): Promise<RealtimeMode> {
  if (!modePromise) {
    modePromise = new Promise<RealtimeMode>((resolve) => {
      if (!env.NEXT_PUBLIC_SOCKET_URL) {
        resolve('polling');
        return;
      }

      const candidate = io(env.NEXT_PUBLIC_SOCKET_URL, {
        timeout: 3000,
        reconnectionAttempts: 0,
      });

      const settle = (mode: RealtimeMode) => {
        candidate.off('connect', onConnect);
        candidate.off('connect_error', onError);
        resolve(mode);
      };
      const onConnect = () => {
        socket = candidate;
        settle('socket');
      };
      const onError = () => {
        candidate.disconnect();
        settle('polling');
      };

      candidate.once('connect', onConnect);
      candidate.once('connect_error', onError);
    });
  }
  return modePromise;
}

export function getSocket(): Socket | null {
  return socket;
}
