import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { MenuCategory } from '@/lib/types';
import { MENU_STALE_TIME_MS } from './queryConfig';

export const menuCategoriesQueryKey = ['menu-categories'] as const;

export function useMenuCategories() {
  return useQuery<MenuCategory[], AppError>({
    queryKey: menuCategoriesQueryKey,
    queryFn: () => api.getCategories(),
    staleTime: MENU_STALE_TIME_MS,
  });
}
