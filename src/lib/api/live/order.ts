// Real customer-facing order rounds — submit + read-your-own-history. Admin round/queue
// status transitions live in admin.ts.
import type { ID } from '@/lib/types/common';
import type { OrderItemView, OrderRoundDetail, OrderRoundStatus } from '@/lib/types';
import type { SessionMemberView } from '../contract';
import { liffHttp } from './http/liffHttp';
import { getMembers } from './session';
import { ORDER_ITEM_STATUS_FROM_BACKEND, type BackendOrderItemStatus } from './orderItemStatus';

interface BackendOrderItem {
  id: string;
  orderRoundId: string;
  menuItemId: string;
  addedBy: string;
  quantity: number;
  unitPriceSnapshot: number;
  nameSnapshot: string;
  note: string;
  status: BackendOrderItemStatus;
  startedAt: string | null;
  estimatedMinutes: number;
}

interface BackendOrderRound {
  id: string;
  tableSessionId: string;
  roundNumber: number;
  status: 'SUBMITTED' | 'COMPLETED';
  submittedAt: string;
  orderItems: BackendOrderItem[];
}

const ROUND_STATUS_MAP: Record<BackendOrderRound['status'], OrderRoundStatus> = {
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
};

// `addedBy` on an order item is a sessionMemberId, same as cart items.
function mapOrderItem(
  item: BackendOrderItem,
  membersById: Map<ID, SessionMemberView>,
): OrderItemView {
  const member = membersById.get(item.addedBy);
  return {
    id: item.id,
    orderRoundId: item.orderRoundId,
    menuItemId: item.menuItemId,
    addedBy: item.addedBy,
    quantity: item.quantity,
    unitPriceSnapshot: item.unitPriceSnapshot,
    nameSnapshot: item.nameSnapshot,
    note: item.note,
    status: ORDER_ITEM_STATUS_FROM_BACKEND[item.status],
    startedAt: item.startedAt,
    estimatedMinutes: item.estimatedMinutes,
    addedByName: member?.displayName ?? 'เพื่อนร่วมโต๊ะ',
  };
}

function mapOrderRound(
  round: BackendOrderRound,
  membersById: Map<ID, SessionMemberView>,
): OrderRoundDetail {
  return {
    id: round.id,
    tableSessionId: round.tableSessionId,
    roundNumber: round.roundNumber,
    status: ROUND_STATUS_MAP[round.status],
    submittedAt: round.submittedAt,
    items: round.orderItems.map((item) => mapOrderItem(item, membersById)),
  };
}

export async function submitRound(sessionId: ID): Promise<OrderRoundDetail> {
  const [{ data }, members] = await Promise.all([
    liffHttp.post<BackendOrderRound>('/liff/orders'),
    getMembers(sessionId),
  ]);
  return mapOrderRound(data, new Map(members.map((m) => [m.id, m])));
}

export async function getRounds(sessionId: ID): Promise<OrderRoundDetail[]> {
  const [{ data }, members] = await Promise.all([
    liffHttp.get<BackendOrderRound[]>('/liff/orders'),
    getMembers(sessionId),
  ]);
  const membersById = new Map(members.map((m) => [m.id, m]));
  return [...data]
    .sort((a, b) => a.roundNumber - b.roundNumber)
    .map((round) => mapOrderRound(round, membersById));
}
