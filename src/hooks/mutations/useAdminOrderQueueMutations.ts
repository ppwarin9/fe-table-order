import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { OrderItemStatus } from '@/lib/types';
import type { ID } from '@/lib/types/common';

export function useUpdateOrderItemStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { orderItemId: ID; status: OrderItemStatus }>({
    mutationFn: ({ orderItemId, status }) => api.updateItemStatus(orderItemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order-queue'] });
    },
  });
}
