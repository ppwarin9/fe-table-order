'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useSessionStore } from '@/stores/sessionStore';
import { Skeleton } from '@/components/ui/skeleton';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrToken = searchParams.get('t');
  const setSession = useSessionStore((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!qrToken) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await api.joinTable(qrToken);
        if (cancelled) return;
        setSession({
          sessionId: result.tableSessionId,
          memberId: result.memberId,
          sessionToken: result.sessionToken,
          tableNumber: result.tableNumber,
        });
        router.replace('/menu'); // replace ไม่ใช่ push — กัน back กลับมา join ซ้ำ
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [qrToken, setSession, router]);

  if (!qrToken) return <p className="text-destructive">ไม่พบข้อมูลโต๊ะใน QR Code</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  return <Skeleton className="h-4 w-40" />;
}

// useSearchParams บังคับห่อ Suspense (กติกา Next)
export default function JoinPage() {
  return (
    <Suspense fallback={<Skeleton className="h-4 w-40" />}>
      <JoinContent />
    </Suspense>
  );
}
