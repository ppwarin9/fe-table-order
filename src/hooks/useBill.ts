'use client';

import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/sessionStore';
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { BillDetail, PaymentMethodCode, SplitMethod } from '@/lib/types';
import type { ID } from '@/lib/types/common';

export function billQueryKey(sessionId: ID | null) {
  return ['bill', sessionId] as const;
}

export function useBill() {
  const { sessionId } = useSessionStore();
  const queryClient = useQueryClient();
  useRealtimeInvalidate(
    sessionId,
    ['bill:issued', 'bill_share:updated', 'payment:updated'],
    billQueryKey(sessionId),
  );

  // Overlays "notified" locally right after the customer notifies a payment, until the
  // next getBill() shows the share as PAID (see BillShareView.notified doc comment).
  const [notifiedShareIds, setNotifiedShareIds] = useState<Set<ID>>(new Set());

  const query = useQuery<BillDetail | null, AppError>({
    queryKey: billQueryKey(sessionId),
    queryFn: () => api.getBill(sessionId as ID),
    enabled: Boolean(sessionId),
    refetchInterval: 5000,
  });

  const issueBill = useCallback(
    async (splitMethod: SplitMethod, payerId?: ID) => {
      if (!sessionId) throw new Error('ยังไม่ได้เข้าร่วมโต๊ะ');
      const bill = await api.issueBill(sessionId, splitMethod, payerId);
      queryClient.setQueryData(billQueryKey(sessionId), bill);
      return bill;
    },
    [sessionId, queryClient],
  );

  const payShare = useCallback(
    async (billShareId: ID, method: PaymentMethodCode) => {
      const payment = await api.createPayment(billShareId, method);
      await api.notifyPayment(payment.id);
      setNotifiedShareIds((prev) => new Set(prev).add(billShareId));
      await query.refetch();
    },
    [query],
  );

  const bill: BillDetail | null = query.data
    ? {
        ...query.data,
        shares: query.data.shares.map((share) =>
          share.status !== 'paid' && notifiedShareIds.has(share.id)
            ? { ...share, notified: true }
            : share,
        ),
      }
    : null;

  return {
    bill,
    loading: query.isPending,
    error: query.error,
    issueBill,
    payShare,
    refetch: query.refetch,
  };
}
