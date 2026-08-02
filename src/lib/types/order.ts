import type { ID, Satang } from '@/lib/types/common';

export type OrderRoundStatus = 'submitted' | 'completed';
export type OrderItemStatus = 'pending' | 'cooking' | 'served';

export interface OrderRound {
  id: ID;
  tableSessionId: ID;
  roundNumber: number;
  status: OrderRoundStatus;
  submittedAt: string;
}

export interface OrderItem {
  id: ID;
  orderRoundId: ID;
  menuItemId: ID;
  addedBy: ID;
  quantity: number;
  unitPriceSnapshot: Satang;
  nameSnapshot: string;
  note: string;
  status: OrderItemStatus;
  startedAt: string | null;
  estimatedMinutes: number;
}

export interface OrderItemSharer {
  orderItemId: ID;
  sessionMemberId: ID;
}

export interface OrderItemView extends OrderItem {
  addedByName: string;
}

export interface OrderRoundDetail extends OrderRound {
  items: OrderItemView[];
}
