import { ID, Satang } from '@/lib/types/common';

export type PaymentMethodCode = 'promptpay' | 'cash';
export type PaymentStatus = 'pending' | 'notified' | 'confirmed' | 'failed';

export interface PaymentMethod {
  id: ID;
  code: PaymentMethodCode;
  name: string;
  isActive: boolean;
}

export interface Payment {
  id: ID;
  billShareId: ID;
  paymentMethodId: ID;
  amount: Satang;
  status: PaymentStatus;
  confirmedBy: ID | null;
  markedBy: ID | null;
  gatewayRef: string | null;
  notifiedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}
