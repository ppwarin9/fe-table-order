import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { DiningTable } from '@/lib/types';

export const adminTablesQueryKey = ['admin', 'tables'] as const;

export function useAdminTables() {
  return useQuery<DiningTable[], AppError>({
    queryKey: adminTablesQueryKey,
    queryFn: () => api.getTables(),
  });
}
