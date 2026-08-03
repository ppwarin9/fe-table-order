'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AddCartItemInput } from '@/lib/api/contract';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { CartDetail, CartItemView, MenuItem } from '@/lib/types';
import type { ID } from '@/lib/types/common';
import { cartQueryKey } from '@/hooks/queries/useCart';
import { useSessionStore } from '@/stores/sessionStore';

interface MutationContext {
  previous?: CartDetail;
}

function recomputeTotals(items: CartItemView[]): Pick<CartDetail, 'items' | 'totalQuantity' | 'totalAmount'> {
  return {
    items,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    totalAmount: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
  };
}

/** Optimistically appends the new line so adding to cart feels instant — the real
 *  server response (fetched via onSettled's invalidation) always wins once it lands. */
export function useAddCartItem() {
  const queryClient = useQueryClient();
  const { sessionId, memberId } = useSessionStore();

  return useMutation<CartDetail, AppError, AddCartItemInput, MutationContext>({
    mutationFn: (input) => {
      if (!sessionId || !memberId) throw new Error('ยังไม่ได้เข้าร่วมโต๊ะ');
      return api.addItem(sessionId, memberId, input);
    },
    onMutate: async (input) => {
      const key = cartQueryKey(sessionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CartDetail>(key);

      // Menu items are cached per-category (see useMenuItems) — scan every cached
      // 'menu-items' list rather than assuming which category key holds this item.
      const menuItemLists = queryClient.getQueriesData<MenuItem[]>({ queryKey: ['menu-items'] });
      const menuItem = menuItemLists
        .flatMap(([, items]) => items ?? [])
        .find((m) => m.id === input.menuItemId);

      if (previous && menuItem) {
        const optimisticItem: CartItemView = {
          id: `optimistic-${Date.now()}`,
          cartId: previous.cart.id,
          menuItemId: input.menuItemId,
          addedBy: memberId ?? '',
          quantity: input.quantity,
          note: input.note ?? '',
          addedAt: new Date().toISOString(),
          menuName: menuItem.name,
          imageUrl: menuItem.imageUrl,
          unitPrice: menuItem.price,
          modifiers: [],
          addedByName: 'คุณ',
          addedByPicture: '',
        };
        queryClient.setQueryData<CartDetail>(key, {
          ...previous,
          ...recomputeTotals([...previous.items, optimisticItem]),
        });
      }

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(cartQueryKey(sessionId), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey(sessionId) });
    },
  });
}

/** Covers both quantity changes and removal (quantity <= 0). */
export function useUpdateCartItemQty() {
  const queryClient = useQueryClient();
  const { sessionId } = useSessionStore();

  return useMutation<CartDetail, AppError, { cartItemId: ID; quantity: number }, MutationContext>({
    mutationFn: ({ cartItemId, quantity }) => {
      if (!sessionId) throw new Error('ยังไม่ได้เข้าร่วมโต๊ะ');
      return api.updateQty(sessionId, cartItemId, quantity);
    },
    onMutate: async ({ cartItemId, quantity }) => {
      const key = cartQueryKey(sessionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CartDetail>(key);

      if (previous) {
        const items =
          quantity <= 0
            ? previous.items.filter((i) => i.id !== cartItemId)
            : previous.items.map((i) => (i.id === cartItemId ? { ...i, quantity } : i));
        queryClient.setQueryData<CartDetail>(key, { ...previous, ...recomputeTotals(items) });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(cartQueryKey(sessionId), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey(sessionId) });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { sessionId } = useSessionStore();

  return useMutation<CartDetail, AppError, ID>({
    mutationFn: (cartItemId) => {
      if (!sessionId) throw new Error('ยังไม่ได้เข้าร่วมโต๊ะ');
      return api.removeItem(sessionId, cartItemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey(sessionId) });
    },
  });
}
