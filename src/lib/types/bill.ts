import type { ID, Satang } from '@/lib/types/common';
import type { SplitMethod } from '@/lib/types/store';

export type BillStatus = 'open' | 'settled' | 'void';
export type BillShareStatus = 'unpaid' | 'paid';

export interface Bill {
  id: ID;
  tableSessionId: ID;
  status: BillStatus;
  splitMethod: SplitMethod;
  subtotal: Satang;
  serviceChargeRateSnapshot: number;
  serviceChargeAmount: Satang;
  vatRateSnapshot: number;
  vatAmount: Satang;
  grandTotal: Satang;
  currencySnapshot: string;
  issuedBy: ID | null;
  issuedAt: string;
  settledAt: string | null;
}

export interface BillShare {
  id: ID;
  billId: ID;
  sessionMemberId: ID;
  amountDue: Satang;
  status: BillShareStatus;
}

export interface BillShareView extends BillShare {
  memberName: string;
  memberPicture: string;
  paidAmount: Satang;
  // No endpoint reads a share's in-flight PENDING/NOTIFIED payment status independent of
  // creating/notifying it yourself — this is overlaid locally right after notifying
  // (see useBill) until the next getBill() shows the share as PAID.
  notified?: boolean;
}

export interface BillDetail {
  bill: Bill;
  shares: BillShareView[];
}
