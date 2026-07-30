import { db } from '@/lib/mock/db';
import { delay } from '@/lib/mock/helpers';
import type { MenuCategory, MenuItem } from '@/lib/types';
import type { ID } from '@/lib/types/common';

export async function getCategories(): Promise<MenuCategory[]> {
  await delay();
  return db.menuCategories
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getMenuItems(categoryId?: ID): Promise<MenuItem[]> {
  await delay();
  return db.menuItems.filter(
    (m) => (m.isAvailable && !categoryId) || m.categoryId === categoryId,
  );
}
