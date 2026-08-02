import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { CartDetail } from '@/lib/types';
import type { ID } from '@/lib/types/common';
import { useRealtimeQueryOptions } from '@/hooks/useRealtimeQueryOptions';
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate';

export function cartQueryKey(sessionId: ID | null) {
  return ['cart', sessionId] as const;
}

/** staleTime 0 — the cart is collaboratively edited by multiple diners at the same
 *  table, so every read is treated as potentially stale, unlike menu data. */
export function useCartQuery(sessionId: ID | null) {
  const realtimeOptions = useRealtimeQueryOptions();
  useRealtimeInvalidate(sessionId, ['cart:updated'], cartQueryKey(sessionId));
  return useQuery<CartDetail, AppError>({
    queryKey: cartQueryKey(sessionId),
    queryFn: () => api.getCart(sessionId as ID),
    enabled: Boolean(sessionId),
    staleTime: 0,
    ...realtimeOptions,
  });
}
