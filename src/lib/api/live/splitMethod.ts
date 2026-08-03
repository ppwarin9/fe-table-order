// Shared split-method mapping — the backend's enum is uppercase, this app's
// SplitMethod type is lowercase. Centralized so admin.ts (read + write) and bill.ts
// (read + write) can't drift out of sync.
import type { SplitMethod } from '@/lib/types';

export type BackendSplitMethod = 'EQUAL' | 'SINGLE_PAYER';

export const SPLIT_METHOD_TO_BACKEND: Record<SplitMethod, BackendSplitMethod> = {
  equal: 'EQUAL',
  single_payer: 'SINGLE_PAYER',
};

export const SPLIT_METHOD_FROM_BACKEND: Record<BackendSplitMethod, SplitMethod> = {
  EQUAL: 'equal',
  SINGLE_PAYER: 'single_payer',
};
