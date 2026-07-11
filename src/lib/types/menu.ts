import { ID, Satang } from '@/lib/types/common';

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

export interface ModifierGroup {
  id: ID;
  storeId: ID;
  name: string;
  isRequired: boolean;
  maxSelect: number;
}

export interface ModifierOption {
  id: ID;
  modifierGroupId: ID;
  name: string;
  priceDelta: Satang;
  isActive: boolean;
}

export interface MenuItemModifierGroup {
  menuItemId: ID;
  modifierGroupId: ID;
}

export interface MenuItemDetail extends MenuItem {
  modifierGroups: (ModifierGroup & { option: ModifierOption[] })[];
}
