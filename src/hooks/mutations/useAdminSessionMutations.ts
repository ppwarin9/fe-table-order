import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';
import { activeSessionsQueryKey } from '@/hooks/queries/useAdminDashboard';

export function useCloseSession() {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, ID>({
    mutationFn: (sessionId) => api.closeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activeSessionsQueryKey });
    },
  });
}
