'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-4xl">😵</div>
      <p className="text-sm font-medium">เกิดข้อผิดพลาดที่ไม่คาดคิด</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        หน้านี้พังโดยไม่คาดคิด ลองกดปุ่มด้านล่างเพื่อลองใหม่ ถ้ายังไม่หายลองรีเฟรชหน้าเว็บ
      </p>
      <Button onClick={reset}>ลองใหม่</Button>
    </div>
  );
}
