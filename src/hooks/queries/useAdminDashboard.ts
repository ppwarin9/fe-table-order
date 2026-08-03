import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ActiveSessionView, SalesReport } from '@/lib/api/contract';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import { useRealtimeQueryOptions } from '@/hooks/useRealtimeQueryOptions';
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate';

export const activeSessionsQueryKey = ['admin', 'active-sessions'] as const;

export function useActiveSessions() {
  const realtimeOptions = useRealtimeQueryOptions();
  useRealtimeInvalidate(
    null,
    [
      'session:closed',
      'round:submitted',
      'order_item:updated',
      'bill:issued',
      'bill_share:updated',
      'payment:updated',
    ],
    activeSessionsQueryKey,
  );
  return useQuery<ActiveSessionView[], AppError>({
    queryKey: activeSessionsQueryKey,
    queryFn: () => api.getActiveSessions(),
    ...realtimeOptions,
  });
}

export function dailyReportQueryKey(date: string) {
  return ['admin', 'daily-report', date] as const;
}

export function useDailyReport(date: string) {
  return useQuery<SalesReport, AppError>({
    queryKey: dailyReportQueryKey(date),
    queryFn: () => api.getReport(date),
  });
}
