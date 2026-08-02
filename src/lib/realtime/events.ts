import type { ID } from '@/lib/types/common';

export type RTEventType =
  | 'cart:updated'
  | 'round:submitted'
  | 'order_item:updated'
  | 'bill:issued'
  | 'bill_share:updated'
  | 'payment:updated'
  | 'session:closed';

export interface RTEvent<T = unknown> {
  type: RTEventType;
  tableSessionId: ID;
  payload: T;
}
