import type { Satang } from '@/lib/types/common';

export interface BillBreakdown {
  subtotal: Satang;
  discountAmount: Satang;
  serviceChargeRateSnapshot: number;
  serviceChargeAmount: Satang;
  vatRateSnapshot: number;
  vatAmount: Satang;
  grandTotal: Satang;
}

const lineTotal = {};

const applyDiscount = {};

export function calcBill() {}
