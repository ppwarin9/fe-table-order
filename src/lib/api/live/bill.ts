// Real bill generation + payment record lifecycle. What's simulated is the actual money
// movement (no PromptPay gateway exists yet) — the record-creation/notify/confirm
// workflow itself is real.
import { useSessionStore } from '@/stores/sessionStore';
import type { ID } from '@/lib/types/common';
import type {
  BillDetail,
  BillShareStatus,
  BillShareView,
  BillStatus,
  PaymentMethodCode,
  SplitMethod,
} from '@/lib/types';
import type { PaymentView } from '../contract';
import { liffHttp } from './http/liffHttp';

type BackendSplitMethod = 'EQUAL' | 'SINGLE_PAYER';
type BackendBillStatus = 'OPEN' | 'SETTLED' | 'VOID';
type BackendBillShareStatus = 'UNPAID' | 'PAID';
type BackendPaymentMethod = 'PROMPTPAY' | 'CASH';

const SPLIT_METHOD_TO_BACKEND: Record<SplitMethod, BackendSplitMethod> = {
  equal: 'EQUAL',
  single_payer: 'SINGLE_PAYER',
};
const SPLIT_METHOD_FROM_BACKEND: Record<BackendSplitMethod, SplitMethod> = {
  EQUAL: 'equal',
  SINGLE_PAYER: 'single_payer',
};
const BILL_STATUS_FROM_BACKEND: Record<BackendBillStatus, BillStatus> = {
  OPEN: 'open',
  SETTLED: 'settled',
  VOID: 'void',
};
const BILL_SHARE_STATUS_FROM_BACKEND: Record<BackendBillShareStatus, BillShareStatus> = {
  UNPAID: 'unpaid',
  PAID: 'paid',
};
const PAYMENT_METHOD_TO_BACKEND: Record<PaymentMethodCode, BackendPaymentMethod> = {
  promptpay: 'PROMPTPAY',
  cash: 'CASH',
};

interface BackendBillShare {
  id: string;
  billId: string;
  sessionMemberId: string;
  amountDue: number;
  status: BackendBillShareStatus;
}

interface BackendBill {
  id: string;
  tableSessionId: string;
  status: BackendBillStatus;
  splitMethod: BackendSplitMethod;
  subtotal: number;
  discountAmount: number;
  serviceChargeRateSnapshot: number;
  serviceChargeAmount: number;
  vatRateSnapShot: number;
  vatAmount: number;
  grandTotal: number;
  currencySnapShot: string;
  issuedAt: string;
  settledAt: string | null;
  billShares: BackendBillShare[];
}

interface BackendPayment {
  id: string;
  billShareId: string;
  method: BackendPaymentMethod;
  amount: number;
  status: 'PENDING' | 'NOTIFIED' | 'CONFIRMED' | 'FAILED';
}

// No endpoint lists other table members' names on the bill itself — same "you vs.
// table-mate" labeling used for cart/order lines.
function labelMember(sessionMemberId: string): string {
  return sessionMemberId === useSessionStore.getState().memberId ? 'คุณ' : 'เพื่อนร่วมโต๊ะ';
}

function mapShare(share: BackendBillShare): BillShareView {
  return {
    id: share.id,
    billId: share.billId,
    sessionMemberId: share.sessionMemberId,
    amountDue: share.amountDue,
    status: BILL_SHARE_STATUS_FROM_BACKEND[share.status],
    memberName: labelMember(share.sessionMemberId),
    memberPicture: '',
    paidAmount: share.status === 'PAID' ? share.amountDue : 0,
  };
}

function mapBill(bill: BackendBill): BillDetail {
  return {
    bill: {
      id: bill.id,
      tableSessionId: bill.tableSessionId,
      status: BILL_STATUS_FROM_BACKEND[bill.status],
      splitMethod: SPLIT_METHOD_FROM_BACKEND[bill.splitMethod],
      subtotal: bill.subtotal,
      discountAmount: bill.discountAmount,
      serviceChargeRateSnapshot: bill.serviceChargeRateSnapshot,
      serviceChargeAmount: bill.serviceChargeAmount,
      vatRateSnapshot: bill.vatRateSnapShot,
      vatAmount: bill.vatAmount,
      grandTotal: bill.grandTotal,
      currencySnapshot: bill.currencySnapShot,
      issuedBy: null,
      issuedAt: bill.issuedAt,
      settledAt: bill.settledAt,
    },
    shares: bill.billShares.map(mapShare),
    discounts: [],
  };
}

export async function issueBill(
  sessionId: ID,
  splitMethod: SplitMethod,
  payerId?: ID,
): Promise<BillDetail> {
  void sessionId;
  const { data } = await liffHttp.post<BackendBill>('/liff/bills', {
    splitMethod: SPLIT_METHOD_TO_BACKEND[splitMethod],
    payerSessionMemberId: splitMethod === 'single_payer' ? payerId : undefined,
  });
  return mapBill(data);
}

export async function getBill(sessionId: ID): Promise<BillDetail | null> {
  void sessionId;
  const { data } = await liffHttp.get<BackendBill[]>('/liff/bills');
  const openBill = data.find((b) => b.status === 'OPEN');
  if (openBill) return mapBill(openBill);

  const settled = data
    .filter((b) => b.status === 'SETTLED')
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  return settled[0] ? mapBill(settled[0]) : null;
}

export async function createPayment(
  billShareId: ID,
  method: PaymentMethodCode,
): Promise<PaymentView> {
  const { data } = await liffHttp.post<BackendPayment>(
    `/liff/bills/bill-shares/${billShareId}/payments`,
    { method: PAYMENT_METHOD_TO_BACKEND[method] },
  );
  return {
    id: data.id,
    billShareId: data.billShareId,
    method,
    amount: data.amount,
    status: data.status.toLowerCase() as PaymentView['status'],
  };
}

export async function notifyPayment(paymentId: ID): Promise<void> {
  await liffHttp.patch(`/liff/bills/payments/${paymentId}/notify`);
}
