import type { ID } from '@/lib/types/common';

// The backend only ever supports these two (see BillModule) — no itemized split exists.
export type SplitMethod = 'equal' | 'single_payer';

// Single-store app — StoreSetting is a singleton row, no storeId column exists on it.
export interface StoreSetting {
  id: ID;
  enableVat: boolean;
  vatRate: number;
  enableServiceCharge: boolean;
  serviceChargeRate: number;
  currency: string;
  timezone: string;
  defaultSplitMethod: SplitMethod;
  updatedAt: string;
}

// Fields the backend's UpdateStoreSettingDto actually accepts — id/updatedAt are
// server-managed, and the global ValidationPipe's forbidNonWhitelisted rejects the whole
// request if either is included in the PATCH body.
export type StoreSettingPatch = Partial<
  Omit<StoreSetting, 'id' | 'updatedAt'>
>;
