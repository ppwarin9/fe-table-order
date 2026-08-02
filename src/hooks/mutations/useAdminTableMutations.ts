import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { DiningTable } from '@/lib/types';
import type { ID } from '@/lib/types/common';
import { adminTablesQueryKey } from '@/hooks/queries/useAdminTables';

function useInvalidateTables() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminTablesQueryKey });
}

export function useCreateTable() {
  const invalidate = useInvalidateTables();
  return useMutation<DiningTable, AppError, string>({
    mutationFn: (tableNumber) => api.createTable(tableNumber),
    onSuccess: invalidate,
  });
}

export function useDeleteTable() {
  const invalidate = useInvalidateTables();
  return useMutation<void, AppError, ID>({
    mutationFn: (tableId) => api.deleteTable(tableId),
    onSuccess: invalidate,
  });
}

/** Regenerating a QR immediately invalidates the old printed code — every existing
 *  /join?t=<oldQrToken> link stops working the moment this succeeds. */
export function useRegenerateQr() {
  const invalidate = useInvalidateTables();
  return useMutation<DiningTable, AppError, ID>({
    mutationFn: (tableId) => api.regenerateQr(tableId),
    onSuccess: invalidate,
  });
}
