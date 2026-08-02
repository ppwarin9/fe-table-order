// Shared order-item status mapping — the backend's enum is uppercase, this app's
// OrderItemStatus type is lowercase. Centralized so order.ts (read-only) and admin.ts
// (read + write) can't drift out of sync.
import type { OrderItemStatus } from '@/lib/types';

export type BackendOrderItemStatus = 'PENDING' | 'COOKING' | 'SERVED';

export const ORDER_ITEM_STATUS_TO_BACKEND: Record<OrderItemStatus, BackendOrderItemStatus> = {
  pending: 'PENDING',
  cooking: 'COOKING',
  served: 'SERVED',
};

export const ORDER_ITEM_STATUS_FROM_BACKEND: Record<BackendOrderItemStatus, OrderItemStatus> = {
  PENDING: 'pending',
  COOKING: 'cooking',
  SERVED: 'served',
};
