import type { ID, Satang } from '@/lib/types/common';

export interface Cart {
  id: ID;
  tableSessionId: ID;
  updatedAt: string;
}

export interface CartItem {
  id: ID;
  cartId: ID;
  menuItemId: ID;
  addedBy: ID;
  quantity: number;
  note: string;
  addedAt: string;
}

export interface CartItemModifier {
  cartItemId: ID;
  modifierOptionId: ID;
}

export interface CartItemView extends CartItem {
  menuName: string;
  imageUrl: string;
  unitPrice: Satang;
  modifiers: { optionId: ID; name: string; priceDelta: Satang }[];
  addedByName: string;
  addedByPicture: string;
}

export interface CartDetail {
  cart: Cart;
  items: CartItemView[];
  totalQuantity: number;
  totalAmount: Satang;
}
