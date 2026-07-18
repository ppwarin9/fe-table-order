import { db } from '@/lib/mock/db';
import { delay } from '@/lib/mock/helpers';
import type { DiningTable } from '@/lib/types';

export async function getTables(): Promise<DiningTable[]> {
  await delay();
  return [...db.diningTables];
}
