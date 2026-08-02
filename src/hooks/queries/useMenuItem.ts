import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';
import type { MenuItemDetail } from '@/lib/types';

export function useMenuItem(menuItemId: ID | undefined) {
  return useQuery<MenuItemDetail, AppError>({
    queryKey: ['menu-item', menuItemId],
    queryFn: () => api.getMenuItem(menuItemId as ID),
    enabled: Boolean(menuItemId),
  });
}
