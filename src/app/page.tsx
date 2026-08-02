'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { liffService } from '@/lib/liff';

// `liff.state` shows up in two different shapes depending on which redirect this is:
//  - Initial launch from the bare QR URL (https://liff.line.me/<liffId>?t=<token>):
//    `liff.state=?t=<token>` — just the original query string.
//  - After the LINE login OAuth round-trip: `liff.state=/join?t=<token>&liff.hback=2` —
//    a full path+query, because that's what the URL looked like when liff.login() was
//    triggered (from /join's needsLogin screen). In this second case `code`/`state`
//    (LINE's OAuth params) are also present on this exact URL, and liff.init() MUST run
//    here — on the page that actually has them — to complete the token exchange, before
//    navigating away and losing them.
function resolveLiffTarget(searchParams: URLSearchParams): string | null {
  const liffState = searchParams.get('liff.state');
  if (liffState) {
    if (liffState.startsWith('/')) return liffState;
    const t = new URLSearchParams(liffState.replace(/^\?/, '')).get('t');
    return t ? `/join?t=${encodeURIComponent(t)}` : null;
  }
  const t = searchParams.get('t');
  return t ? `/join?t=${encodeURIComponent(t)}` : null;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [qrToken, setQrToken] = useState('');

  useEffect(() => {
    const target = resolveLiffTarget(searchParams);
    if (!target) return;

    if (searchParams.get('code')) {
      // Post-login OAuth callback — let liff.init() consume `code`/`state` from this
      // exact URL first, so the login handshake actually completes.
      liffService.init().finally(() => router.replace(target));
    } else {
      router.replace(target);
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
