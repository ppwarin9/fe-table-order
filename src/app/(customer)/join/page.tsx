'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
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
  // กัน React Strict Mode (dev) เรียก effect นี้ซ้ำ ซึ่งจะยิง joinTable จริงซ้ำ 2 ครั้ง
  // ใกล้กันมาก — เสี่ยงชน race condition ฝั่ง backend ตอน find-or-create table session
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!qrToken || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    (async () => {
      try {
        const result = await api.joinTable(qrToken);
        setSession({
          sessionId: result.tableSessionId,
          memberId: result.memberId,
          sessionToken: result.sessionToken,
          tableNumber: result.tableNumber,
        });
        router.replace('/menu'); // replace ไม่ใช่ push — กัน back กลับมา join ซ้ำ
      } catch (e) {
        hasJoinedRef.current = false;
        setError((e as Error).message);
      }
    })();
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
