'use client';

import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/sessionStore';
import { useRoundsQuery } from '@/hooks/queries/useRounds';

export function useOrders() {
  const { sessionId } = useSessionStore();
  const query = useRoundsQuery(sessionId);

  const submitRound = useCallback(async () => {
    if (!sessionId) throw new Error('ยังไม่ได้เข้าร่วมโต๊ะ');
    const round = await api.submitRound(sessionId);
    await query.refetch();
    return round;
  }, [sessionId, query]);

  return {
    rounds: query.data ?? [],
    loading: query.isPending,
    error: query.error,
    submitRound,
    refetch: query.refetch,
  };
}
