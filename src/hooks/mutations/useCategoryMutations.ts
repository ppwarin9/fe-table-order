import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';
import type { MenuCategory } from '@/lib/types';
import { adminMenuCategoriesQueryKey } from '@/hooks/queries/useAdminMenu';
import { menuCategoriesQueryKey } from '@/hooks/queries/useMenuCategories';

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: adminMenuCategoriesQueryKey });
    queryClient.invalidateQueries({ queryKey: menuCategoriesQueryKey });
  };
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation<MenuCategory, AppError, Omit<MenuCategory, 'id' | 'isActive' | 'storeId'>>({
    mutationFn: (input) => api.createCategory(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation<MenuCategory, AppError, { id: ID; input: Partial<Omit<MenuCategory, 'id'>> }>({
    mutationFn: ({ id, input }) => api.updateCategory(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation<void, AppError, ID>({
    mutationFn: (id) => api.deleteCategory(id),
    onSuccess: invalidate,
  });
}
