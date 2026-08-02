import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';
import type { MenuCategory, MenuItem } from '@/lib/types';
import { MENU_STALE_TIME_MS } from './queryConfig';

export const adminMenuCategoriesQueryKey = ['admin', 'menu-categories'] as const;
export const adminMenuItemsQueryKey = ['admin', 'menu-items'] as const;

export function useAdminMenuCategories() {
  return useQuery<MenuCategory[], AppError>({
    queryKey: adminMenuCategoriesQueryKey,
    queryFn: () => api.getCategoriesAdmin(),
    staleTime: MENU_STALE_TIME_MS,
  });
}

export function useAdminMenuItems() {
  return useQuery<MenuItem[], AppError>({
    queryKey: adminMenuItemsQueryKey,
    queryFn: () => api.getMenuItemsAdmin(),
  });
}

export function useAdminMenuItem(menuItemId: ID | undefined) {
  return useQuery<MenuItem, AppError>({
    queryKey: ['admin', 'menu-item', menuItemId],
    queryFn: () => api.getMenuItemAdmin(menuItemId as ID),
    enabled: Boolean(menuItemId),
  });
}
