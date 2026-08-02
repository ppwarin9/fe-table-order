import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { StoreSetting } from '@/lib/types';

export const storeSettingQueryKey = ['admin', 'store-setting'] as const;

export function useStoreSetting() {
  return useQuery<StoreSetting, AppError>({
    queryKey: storeSettingQueryKey,
    queryFn: () => api.getSettings(),
  });
}

export function useUpdateStoreSetting() {
  const queryClient = useQueryClient();
  return useMutation<StoreSetting, AppError, Partial<StoreSetting>>({
    mutationFn: (input) => api.updateSettings(input),
    onSuccess: (setting) => {
      queryClient.setQueryData(storeSettingQueryKey, setting);
    },
  });
}
