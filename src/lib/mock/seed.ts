import type { DiningTable, Store } from '@/lib/types';

export interface SeedData {
  store: Store;
  diningTables: DiningTable[];
}

export function seedDb(): SeedData {
  const now = new Date().toISOString();
  const storeId = 'store-1';

  const store: Store = {
    id: storeId,
    name: 'ร้านลาบเป็ดป้าแดง',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const diningTables: DiningTable[] = Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return {
      id: `table-${n}`,
      storeId,
      tableNumber: String(n),
      qrToken: `qr-token-table-${n}`,
      qrGeneratedAt: now,
      isActive: true,
    };
  });

  return { store, diningTables };
}
