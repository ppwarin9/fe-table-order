import type { ID, Satang } from '@/lib/types/common';
import type { SplitMethod } from '@/lib/types/store';

export type BillStatus = 'open' | 'settled' | 'void';
export type BillShareStatus = 'unpaid' | 'partially_paid';

export interface Bill {
  id: ID;
  tableSessionId: ID;
  status: BillStatus;
  splitMethod: SplitMethod;
  subtotal: Satang;
  discountAmount: Satang;
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

export interface BillDiscount {
  id: ID;
  billId: ID;
  promotionId: ID;
  amountSnapshot: Satang;
}

export interface BillShare {
  id: ID;
  billID: ID;
  sessionMemberId: ID;
  amountDue: Satang;
  status: BillShareStatus;
}

export interface BillShareView extends BillShare {
  memberName: string;
  memberPicture: string;
  paidAmount: Satang;
}

export interface BillDetail {
  bill: Bill;
  shares: BillShareView[];
  discounts: BillDiscount[];
}
