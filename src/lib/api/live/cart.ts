// Real shared table cart. All three mutation endpoints return only the affected item
// (or nothing, for delete) — never the whole cart — so every mutation re-fetches via
// getCart() afterward rather than trying to patch the cache manually.
import type { ID } from '@/lib/types/common';
import type { CartDetail, CartItemView } from '@/lib/types';
import type { AddCartItemInput, SessionMemberView } from '../contract';
import { liffHttp } from './http/liffHttp';
import { getMembers } from './session';

interface BackendCartItem {
  id: string;
  menuItemId: string;
  addedBy: string;
  quantity: number;
  note: string;
  addedAt: string;
  menuItem: { name: string; price: number };
}

interface BackendCart {
  id: string;
  tableSessionId: string;
  updatedAt: string;
  cartItems: BackendCartItem[];
}

// `addedBy` on a cart item is a sessionMemberId, exactly the `id` from
// GET /liff/table-sessions/members — resolves every table-mate's real name/picture.
function resolveAddedBy(
  addedBy: string,
  membersById: Map<ID, SessionMemberView>,
): { name: string; picture: string } {
  const member = membersById.get(addedBy);
  if (!member) return { name: 'เพื่อนร่วมโต๊ะ', picture: '' };
  return { name: member.displayName, picture: member.pictureUrl };
}

function mapCartItem(
  item: BackendCartItem,
  cartId: ID,
  membersById: Map<ID, SessionMemberView>,
): CartItemView {
  const { name, picture } = resolveAddedBy(item.addedBy, membersById);
  return {
    id: item.id,
    cartId,
    menuItemId: item.menuItemId,
    addedBy: item.addedBy,
    quantity: item.quantity,
    note: item.note,
    addedAt: item.addedAt,
    menuName: item.menuItem.name,
    unitPrice: item.menuItem.price,
    modifiers: [],
    addedByName: name,
    addedByPicture: picture,
  };
}

function mapCart(cart: BackendCart, members: SessionMemberView[]): CartDetail {
  const membersById = new Map(members.map((m) => [m.id, m]));
  const items = cart.cartItems.map((item) => mapCartItem(item, cart.id, membersById));
  return {
    cart: { id: cart.id, tableSessionId: cart.tableSessionId, updatedAt: cart.updatedAt },
    items,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    totalAmount: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
  };
}

export async function getCart(sessionId: ID): Promise<CartDetail> {
  const [{ data }, members] = await Promise.all([
    liffHttp.get<BackendCart>('/liff/cart'),
    getMembers(sessionId),
  ]);
  return mapCart(data, members);
}

export async function addItem(
  sessionId: ID,
  memberId: ID,
  input: AddCartItemInput,
): Promise<CartDetail> {
  void memberId; // the backend infers the adding member from the session token
  await liffHttp.post('/liff/cart/items', {
    menuItemId: input.menuItemId,
    quantity: input.quantity,
    note: input.note,
  });
  return getCart(sessionId);
}

export async function updateQty(
  sessionId: ID,
  cartItemId: ID,
  quantity: number,
): Promise<CartDetail> {
  if (quantity <= 0) {
    await liffHttp.delete(`/liff/cart/items/${cartItemId}`);
  } else {
    await liffHttp.patch(`/liff/cart/items/${cartItemId}`, { quantity });
  }
  return getCart(sessionId);
}

export async function removeItem(sessionId: ID, cartItemId: ID): Promise<CartDetail> {
  await liffHttp.delete(`/liff/cart/items/${cartItemId}`);
  return getCart(sessionId);
}
