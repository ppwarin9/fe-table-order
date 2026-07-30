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
