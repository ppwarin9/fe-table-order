import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminOrderItemView } from '@/lib/api/contract';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import { useRealtimeQueryOptions } from '@/hooks/useRealtimeQueryOptions';
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate';

/** Omitting status matches the backend's own default (PENDING+COOKING); there is no way
 *  to request multiple statuses in a single call, so "show served too" issues a second
 *  request for status=served and merges both lists client-side. */
export function useAdminOrderQueue(includeServed: boolean) {
  const realtimeOptions = useRealtimeQueryOptions();
  useRealtimeInvalidate(null, ['round:submitted', 'order_item:updated'], [
    'admin',
    'order-queue',
    includeServed,
  ]);
  return useQuery<AdminOrderItemView[], AppError>({
    queryKey: ['admin', 'order-queue', includeServed],
    queryFn: async () => {
      if (!includeServed) return api.getOrderQueue();
      const [active, served] = await Promise.all([api.getOrderQueue(), api.getOrderQueue('served')]);
      return [...active, ...served];
    },
    ...realtimeOptions,
  });
}
