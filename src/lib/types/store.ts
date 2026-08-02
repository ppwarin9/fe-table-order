import type { ID } from '@/lib/types/common';

export interface Store {
  id: ID;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// The backend only ever supports these two (see BillModule) — no itemized split exists.
export type SplitMethod = 'equal' | 'single_payer';

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
