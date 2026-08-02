import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { MenuItem } from '@/lib/types';
import type { ID } from '@/lib/types/common';
import { MENU_STALE_TIME_MS } from './queryConfig';

export function menuItemsQueryKey(categoryId?: ID) {
  return ['menu-items', categoryId ?? null] as const;
}

/** categoryId is part of the query key — the backend filters server-side
 *  (GET /liff/menu-items?categoryId=...), so each category gets its own cache entry. */
export function useMenuItems(categoryId?: ID) {
  return useQuery<MenuItem[], AppError>({
    queryKey: menuItemsQueryKey(categoryId),
    queryFn: () => api.getMenuItems(categoryId),
    staleTime: MENU_STALE_TIME_MS,
  });
}
