import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { StoreSetting, StoreSettingPatch } from '@/lib/types';

export const storeSettingQueryKey = ['admin', 'store-setting'] as const;

export function useStoreSetting() {
  return useQuery<StoreSetting, AppError>({
    queryKey: storeSettingQueryKey,
    queryFn: () => api.getSettings(),
  });
}

export function useUpdateStoreSetting() {
  const queryClient = useQueryClient();
  return useMutation<StoreSetting, AppError, StoreSettingPatch>({
    mutationFn: (input) => api.updateSettings(input),
    onSuccess: (setting) => {
      queryClient.setQueryData(storeSettingQueryKey, setting);
    },
  });
}
