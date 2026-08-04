import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminBillView } from '@/lib/api/contract';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';
import type { PaymentMethodCode } from '@/lib/types';
import { adminBillQueryKey } from '@/hooks/queries/useAdminBilling';

export function useSettleAdminBillShare(sessionId: ID) {
  const queryClient = useQueryClient();
  return useMutation<AdminBillView, AppError, { shareId: ID; method: PaymentMethodCode }>({
    mutationFn: ({ shareId, method }) => api.settleAdminBillShare(sessionId, shareId, method),
    onSuccess: (bill) => {
      queryClient.setQueryData(adminBillQueryKey(sessionId), bill);
    },
  });
}

export function useConfirmAdminPayment(sessionId: ID) {
  const queryClient = useQueryClient();
  return useMutation<AdminBillView, AppError, ID>({
    mutationFn: (paymentId) => api.confirmAdminPayment(sessionId, paymentId),
    onSuccess: (bill) => {
      queryClient.setQueryData(adminBillQueryKey(sessionId), bill);
    },
  });
}

export function useFailAdminPayment(sessionId: ID) {
  const queryClient = useQueryClient();
  return useMutation<AdminBillView, AppError, ID>({
    mutationFn: (paymentId) => api.failAdminPayment(sessionId, paymentId),
    onSuccess: (bill) => {
      queryClient.setQueryData(adminBillQueryKey(sessionId), bill);
    },
  });
}
