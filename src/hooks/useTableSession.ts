'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/sessionStore';
import { useRealtimeInvalidate } from '@/hooks/useRealtimeInvalidate';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { SessionInfo, SessionMemberView } from '@/lib/api/contract';
import { CUSTOMER_JOIN_PATH } from '@/lib/routes';

export function useTableSession() {
  const router = useRouter();
  const { sessionId, memberId, tableNumber } = useSessionStore();

  useEffect(() => {
    if (!sessionId) router.replace(CUSTOMER_JOIN_PATH);
  }, [sessionId, router]);

  useRealtimeInvalidate(sessionId, ['session:closed'], ['session-info', sessionId]);

  const query = useQuery<{ session: SessionInfo; members: SessionMemberView[] }, AppError>({
    queryKey: ['session-info', sessionId],
    queryFn: async () => {
      const [session, members] = await Promise.all([
        api.getSession(sessionId as string),
        api.getMembers(sessionId as string),
      ]);
      return { session, members };
    },
    enabled: Boolean(sessionId),
  });

  return {
    sessionId,
    memberId,
    tableNumber,
    session: query.data?.session ?? null,
    members: query.data?.members ?? [],
    loading: query.isPending,
    refetch: query.refetch,
  };
}
