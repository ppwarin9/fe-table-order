import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminBillView } from '@/lib/api/contract';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';

export function adminBillQueryKey(sessionId: ID) {
  return ['admin', 'bill', sessionId] as const;
}

export function useAdminBillDetail(sessionId: ID | null) {
  return useQuery<AdminBillView, AppError>({
    queryKey: sessionId ? adminBillQueryKey(sessionId) : ['admin', 'bill', 'none'],
    queryFn: () => api.getAdminBillDetail(sessionId as ID),
    enabled: !!sessionId,
  });
}
