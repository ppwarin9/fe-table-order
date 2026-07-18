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
  nameSnapShot: string;
  note: string;
  status: OrderItemStatus;
  startedAt: string | null;
  estimatedMinutes: number;
}

export interface OrderItemModifier {
  id: ID;
  orderItemId: ID;
  modifierOptionId: ID;
  nameSnapshot: string;
  priceDeltaSnapshot: Satang;
}

export interface OrderItemSharer {
  orderItemId: ID;
  sessionMemberId: ID;
}

export interface OrderItemView extends OrderItem {
  modifiers: OrderItemModifier[];
  addedByName: string;
}

export interface OrderRoundDetail extends OrderRound {
  items: OrderItemView[];
}
