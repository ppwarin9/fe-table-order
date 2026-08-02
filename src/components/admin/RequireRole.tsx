'use client';

import type { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';

/** Wraps a page whose backend endpoints are role-gated so STAFF (or non-SUPERADMIN)
 *  sees a clear message instead of raw 403s from every API call on the page. */
export function RequireRole({ role, children }: { role: 'ADMIN' | 'SUPERADMIN'; children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Skeleton className="h-40 w-full" />;
  }

  const allowed =
    role === 'ADMIN'
      ? session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN'
      : session?.user?.role === 'SUPERADMIN';

  if (!allowed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-2xl">🔒</p>
        <p className="text-sm font-medium">
          {role === 'SUPERADMIN' ? 'เฉพาะผู้ดูแลระบบสูงสุด (Superadmin)' : 'เฉพาะผู้ดูแลระบบ (Admin)'}
        </p>
        <p className="text-sm text-muted-foreground">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  return <>{children}</>;
}
