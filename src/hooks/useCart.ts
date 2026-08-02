'use client';

import { useCallback } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { useCartQuery } from '@/hooks/queries/useCart';
import { useAddCartItem, useRemoveCartItem, useUpdateCartItemQty } from '@/hooks/mutations/useCartMutations';
import type { ID } from '@/lib/types/common';
import type { AddCartItemInput } from '@/lib/api/contract';

export function useCart() {
  const { sessionId } = useSessionStore();
  const query = useCartQuery(sessionId);
  const addItemMutation = useAddCartItem();
  const updateQtyMutation = useUpdateCartItemQty();
  const removeItemMutation = useRemoveCartItem();

  const addItem = useCallback(
    async (input: AddCartItemInput) => {
      await addItemMutation.mutateAsync(input);
    },
    [addItemMutation],
  );

  const updateQty = useCallback(
    async (cartItemId: ID, quantity: number) => {
      await updateQtyMutation.mutateAsync({ cartItemId, quantity });
    },
    [updateQtyMutation],
  );

  const removeItem = useCallback(
    async (cartItemId: ID) => {
      await removeItemMutation.mutateAsync(cartItemId);
    },
    [removeItemMutation],
  );

  return {
    cart: query.data ?? null,
    loading: query.isPending,
    error: query.error,
    addItem,
    updateQty,
    removeItem,
    refetch: query.refetch,
  };
}
