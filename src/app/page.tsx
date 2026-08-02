'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [qrToken, setQrToken] = useState('');

  // The QR-code URL is a bare LIFF URL (https://liff.line.me/<liffId>?t=<qrToken>) with
  // no sub-path — LINE only reliably forwards the query string to the registered
  // Endpoint URL (the site root), never a path segment appended after the LIFF ID. So
  // this root page is the actual landing spot after a scan, and immediately forwards to
  // /join itself instead of relying on LIFF to route straight there.
  useEffect(() => {
    const t = searchParams.get('t');
    if (t) {
      router.replace(`/join?t=${encodeURIComponent(t)}`);
    }
  }, [searchParams, router]);

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

// useSearchParams requires a Suspense boundary.
export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
