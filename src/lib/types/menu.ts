import type { ID, Satang } from '@/lib/types/common';

export interface MenuCategory {
  id: ID;
  storeId: ID;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: ID;
  storeId: ID;
  categoryId: ID;
  name: string;
  description: string;
  price: Satang;
  imageUrl: string;
  estimatedCookingMinutes: number;
  isAvailable: boolean;
}

// Backend has no modifier-group/option system at all — modifierGroups is always [],
// kept only so item-detail UI has a stable (empty) shape to render against.
export interface MenuItemDetail extends MenuItem {
  modifierGroups: never[];
}
