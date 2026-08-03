import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';
import type { MenuCategory } from '@/lib/types';
import { adminMenuCategoriesQueryKey } from '@/hooks/queries/useAdminMenu';
import { menuCategoriesQueryKey } from '@/hooks/queries/useMenuCategories';
import { useInvalidate } from '@/hooks/mutations/useInvalidate';

export function useCreateCategory() {
  const invalidate = useInvalidate(adminMenuCategoriesQueryKey, menuCategoriesQueryKey);
  return useMutation<MenuCategory, AppError, Omit<MenuCategory, 'id' | 'isActive' | 'storeId'>>({
    mutationFn: (input) => api.createCategory(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidate(adminMenuCategoriesQueryKey, menuCategoriesQueryKey);
  return useMutation<MenuCategory, AppError, { id: ID; input: Partial<Omit<MenuCategory, 'id'>> }>({
    mutationFn: ({ id, input }) => api.updateCategory(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidate(adminMenuCategoriesQueryKey, menuCategoriesQueryKey);
  return useMutation<void, AppError, ID>({
    mutationFn: (id) => api.deleteCategory(id),
    onSuccess: invalidate,
  });
}
