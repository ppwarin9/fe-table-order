// Real admin surface: tables, store settings, daily sales report, active sessions, the
// order queue, bill/payment detail, and force-closing a table session.
import type { ID } from '@/lib/types/common';
import type {
  DiningTable,
  OrderItemStatus,
  PaymentMethodCode,
  SplitMethod,
  StoreSetting,
} from '@/lib/types';
import type { ActiveSessionView, AdminBillView, AdminOrderItemView, SalesReport } from '../contract';
import { adminHttp } from './http/adminHttp';
import {
  ORDER_ITEM_STATUS_FROM_BACKEND,
  ORDER_ITEM_STATUS_TO_BACKEND,
  type BackendOrderItemStatus,
} from './orderItemStatus';

type BackendSplitMethod = 'EQUAL' | 'SINGLE_PAYER';

const SPLIT_METHOD_TO_BACKEND: Record<SplitMethod, BackendSplitMethod> = {
  equal: 'EQUAL',
  single_payer: 'SINGLE_PAYER',
};
const SPLIT_METHOD_FROM_BACKEND: Record<BackendSplitMethod, SplitMethod> = {
  EQUAL: 'equal',
  SINGLE_PAYER: 'single_payer',
};

// ---- tables ----

export async function getTables(): Promise<DiningTable[]> {
  const { data } = await adminHttp.get<DiningTable[]>('/admin/tables');
  return data;
}

export async function createTable(tableNumber: string): Promise<DiningTable> {
  const { data } = await adminHttp.post<DiningTable>('/admin/tables', { tableNumber });
  return data;
}

export async function updateTable(
  tableId: ID,
  input: Partial<Omit<DiningTable, 'id'>>,
): Promise<DiningTable> {
  const { tableNumber, isActive } = input;
  const { data } = await adminHttp.patch<DiningTable>(`/admin/tables/${tableId}`, {
    tableNumber,
    isActive,
  });
  return data;
}

export async function regenerateQr(tableId: ID): Promise<DiningTable> {
  const { data } = await adminHttp.patch<DiningTable>(`/admin/tables/${tableId}/regenerate-qr`);
  return data;
}

export async function deleteTable(tableId: ID): Promise<void> {
  await adminHttp.delete(`/admin/tables/${tableId}`);
}

// ---- settings ----

interface BackendStoreSetting {
  id: string;
  storeId: string;
  enableVat: boolean;
  vatRate: number;
  enableServiceCharge: boolean;
  serviceChargeRate: number;
  currency: string;
  timezone: string;
  defaultSplitMethod: BackendSplitMethod;
  updatedAt: string;
}

function mapStoreSetting(setting: BackendStoreSetting): StoreSetting {
  return { ...setting, defaultSplitMethod: SPLIT_METHOD_FROM_BACKEND[setting.defaultSplitMethod] };
}

export async function getSettings(): Promise<StoreSetting> {
  const { data } = await adminHttp.get<BackendStoreSetting>('/admin/store-setting');
  return mapStoreSetting(data);
}

export async function updateSettings(input: Partial<StoreSetting>): Promise<StoreSetting> {
  const { defaultSplitMethod, ...rest } = input;
  const { data } = await adminHttp.patch<BackendStoreSetting>('/admin/store-setting', {
    ...rest,
    defaultSplitMethod: defaultSplitMethod ? SPLIT_METHOD_TO_BACKEND[defaultSplitMethod] : undefined,
  });
  return mapStoreSetting(data);
}

// ---- report ----
// No itemized top-sellers breakdown exists on the backend — topItems is always [].

export async function getReport(date: string): Promise<SalesReport> {
  const { data } = await adminHttp.get<{
    date: string;
    totalSales: number;
    billCount: number;
    orderCount: number;
  }>('/admin/dashboard/daily-sales', { params: { date } });

  return {
    date: data.date,
    totalRevenue: data.totalSales,
    totalOrders: data.billCount,
    orderCount: data.orderCount,
    topItems: [],
  };
}

// ---- live views ----

interface BackendActiveSession {
  tableSessionId: string;
  diningTableId: string;
  tableNumber: string;
  openedAt: string;
  memberCount: number;
  pendingItemCount: number;
}

export async function getActiveSessions(): Promise<ActiveSessionView[]> {
  const { data } = await adminHttp.get<BackendActiveSession[]>('/admin/dashboard/active-sessions');
  return data
    .map((s) => ({
      sessionId: s.tableSessionId,
      tableId: s.diningTableId,
      tableNumber: s.tableNumber,
      openedAt: s.openedAt,
      memberCount: s.memberCount,
      pendingItemCount: s.pendingItemCount,
    }))
    .sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
}

interface BackendAdminOrderItem {
  id: string;
  tableSessionId: string;
  tableNumber: string;
  roundNumber: number;
  quantity: number;
  nameSnapshot: string;
  note: string;
  status: BackendOrderItemStatus;
  startedAt: string | null;
  estimatedMinutes: number;
}

function mapAdminOrderItem(item: BackendAdminOrderItem): AdminOrderItemView {
  return { ...item, status: ORDER_ITEM_STATUS_FROM_BACKEND[item.status] };
}

export async function getOrderQueue(status?: OrderItemStatus): Promise<AdminOrderItemView[]> {
  const { data } = await adminHttp.get<BackendAdminOrderItem[]>('/admin/order-items', {
    params: status ? { status: ORDER_ITEM_STATUS_TO_BACKEND[status] } : undefined,
  });
  return data.map(mapAdminOrderItem);
}

export async function updateItemStatus(orderItemId: ID, status: OrderItemStatus): Promise<void> {
  await adminHttp.patch(`/admin/order-items/${orderItemId}/status`, {
    status: ORDER_ITEM_STATUS_TO_BACKEND[status],
  });
}

// ADMIN-only: invalidates every sessionToken issued under this table session.
export async function closeSession(sessionId: ID): Promise<void> {
  await adminHttp.patch(`/admin/table-sessions/${sessionId}/close`);
}

// ---- billing detail ----

interface BackendAdminBillShare {
  id: string;
  label: string;
  amountDue: number;
  status: 'UNPAID' | 'PAID';
  method: 'PROMPTPAY' | 'CASH' | null;
}

interface BackendAdminBill {
  tableSessionId: string;
  subtotal: number;
  serviceChargeAmount: number;
  vatAmount: number;
  grandTotal: number;
  status: 'OPEN' | 'SETTLED';
  shares: BackendAdminBillShare[];
}

function mapAdminBill(bill: BackendAdminBill): AdminBillView {
  return {
    tableSessionId: bill.tableSessionId,
    subtotal: bill.subtotal,
    serviceChargeAmount: bill.serviceChargeAmount,
    vatAmount: bill.vatAmount,
    grandTotal: bill.grandTotal,
    status: bill.status === 'SETTLED' ? 'settled' : 'open',
    shares: bill.shares.map((share) => ({
      id: share.id,
      label: share.label,
      amountDue: share.amountDue,
      status: share.status === 'PAID' ? 'paid' : 'unpaid',
      method: share.method === 'PROMPTPAY' ? 'promptpay' : share.method === 'CASH' ? 'cash' : null,
    })),
  };
}

export async function getAdminBillDetail(sessionId: ID): Promise<AdminBillView> {
  const { data } = await adminHttp.get<BackendAdminBill>(`/admin/table-sessions/${sessionId}/bill`);
  return mapAdminBill(data);
}

// Cash is settleable directly by billShareId. PromptPay isn't — confirming needs a
// paymentId, and this bill view only exposes billShareId (no endpoint yet discovers the
// paymentId a share's in-flight PromptPay payment was created under).
export async function settleAdminBillShare(
  sessionId: ID,
  shareId: ID,
  method: PaymentMethodCode,
): Promise<AdminBillView> {
  if (method !== 'cash') {
    throw new Error('ยังไม่รองรับการยืนยันพร้อมเพย์จากหน้านี้ — ต้องจ่ายผ่านหน้าลูกค้าแล้วให้พนักงานกดยืนยันที่ระบบแยกต่างหาก');
  }
  await adminHttp.post(`/admin/payments/bill-shares/${shareId}/cash`);
  return getAdminBillDetail(sessionId);
}
