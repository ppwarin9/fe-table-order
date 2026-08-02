import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';
import type { MenuItem } from '@/lib/types';
import { adminMenuItemsQueryKey } from '@/hooks/queries/useAdminMenu';
import { menuItemsQueryKey } from '@/hooks/queries/useMenuItems';

function useInvalidateMenuItems() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: adminMenuItemsQueryKey });
    queryClient.invalidateQueries({ queryKey: menuItemsQueryKey() });
  };
}

export function useCreateMenuItem() {
  const invalidate = useInvalidateMenuItems();
  return useMutation<MenuItem, AppError, Omit<MenuItem, 'id' | 'isAvailable' | 'storeId'>>({
    mutationFn: (input) => api.createMenuItem(input),
    onSuccess: invalidate,
  });
}

export function useUpdateMenuItem() {
  const invalidate = useInvalidateMenuItems();
  return useMutation<MenuItem, AppError, { id: ID; input: Partial<Omit<MenuItem, 'id'>> }>({
    mutationFn: ({ id, input }) => api.updateMenuItem(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteMenuItem() {
  const invalidate = useInvalidateMenuItems();
  return useMutation<void, AppError, ID>({
    mutationFn: (id) => api.deleteMenuItem(id),
    onSuccess: invalidate,
  });
}
