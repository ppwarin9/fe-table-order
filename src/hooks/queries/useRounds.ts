import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { OrderRoundDetail } from '@/lib/types';
import type { ID } from '@/lib/types/common';
import { useRealtimeQueryOptions } from '@/hooks/useRealtimeQueryOptions';
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate';

export function roundsQueryKey(sessionId: ID | null) {
  return ['rounds', sessionId] as const;
}

export function useRoundsQuery(sessionId: ID | null) {
  const realtimeOptions = useRealtimeQueryOptions();
  useRealtimeInvalidate(sessionId, ['round:submitted', 'order_item:updated'], roundsQueryKey(sessionId));
  return useQuery<OrderRoundDetail[], AppError>({
    queryKey: roundsQueryKey(sessionId),
    queryFn: () => api.getRounds(sessionId as ID),
    enabled: Boolean(sessionId),
    ...realtimeOptions,
  });
}
