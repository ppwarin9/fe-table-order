'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ClosedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-4xl">🙏</div>
      <p className="text-lg font-semibold">ขอบคุณที่ใช้บริการ</p>
      <p className="text-sm text-muted-foreground">โต๊ะนี้ปิดการใช้งานแล้ว กรุณาสแกน QR Code ใหม่เพื่อเริ่มโต๊ะใหม่</p>
      <Button variant="secondary" onClick={() => router.replace('/')}>
        กลับหน้าแรก
      </Button>
    </div>
  );
}
