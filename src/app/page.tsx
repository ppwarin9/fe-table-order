'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [qrToken, setQrToken] = useState('');

  const handleGo = () => {
    const trimmed = qrToken.trim();
    if (!trimmed) return;
    router.push(`/join?t=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 bg-customer-bg p-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-customer-tint text-customer-primary-dark">
        <QrCode className="size-12" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-customer-text-primary">
          🍽️ ยินดีต้อนรับสู่ TableLink
        </h1>
        <p className="text-[15px] leading-relaxed text-customer-text-secondary">
          กรุณาสแกน QR Code ที่โต๊ะของคุณ
          <br />
          เพื่อเข้าร่วมและสั่งอาหารได้เลย!!
        </p>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="w-full text-left">
          <p className="mb-2 text-xs font-semibold text-customer-text-secondary">
            [DEV] กรอก qrToken เพื่อทดสอบ
          </p>
          <div className="flex gap-2">
            <Input
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGo()}
              placeholder="วาง qrToken ที่นี่"
              className="flex-1"
            />
            <Button onClick={handleGo} disabled={!qrToken.trim()}>
              ไป
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
