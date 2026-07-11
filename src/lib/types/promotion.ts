import { ID } from '@/lib/types/common';

export type DiscountType = 'percent' | 'fixed';

export interface Promotion {
  id: ID;
  storeId: ID;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}
