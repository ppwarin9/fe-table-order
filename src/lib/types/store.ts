import type { ID } from '@/lib/types/common';

export interface Store {
  id: ID;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SplitMethod = 'equal' | 'itemized' | 'single_payer';

export interface StoreSetting {
  id: ID;
  storeId: ID;
  enableVat: boolean;
  vatRate: number;
  enableServiceCharge: boolean;
  serviceChargeRate: number;
  currency: string;
  timezone: string;
  defaultSplitMethod: SplitMethod;
  updatedAt: string;
}
