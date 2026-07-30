'use client';

import { useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  setAdminAccessToken,
  setAdminUnauthorizedHandler,
} from '@/lib/api/live/http/tokenRef';

export function SessionTokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    setAdminAccessToken(session?.accessToken ?? null);
  }, [session?.accessToken]);

  useEffect(() => {
    setAdminUnauthorizedHandler(() => {
      void signOut({ callbackUrl: '/admin/login' });
    });
    return () => setAdminUnauthorizedHandler(null);
  }, []);

  return null;
}
