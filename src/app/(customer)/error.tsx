'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function CustomerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 bg-customer-bg p-6 text-center">
      <div className="text-4xl">😵</div>
      <p className="text-sm font-medium text-customer-text-primary">เกิดข้อผิดพลาดที่ไม่คาดคิด</p>
      <p className="text-xs text-customer-text-secondary">ลองใหม่อีกครั้ง หรือกลับไปหน้าเมนู</p>
      <Button onClick={reset}>ลองใหม่</Button>
    </div>
  );
}
