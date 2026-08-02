'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { liffService } from '@/lib/liff';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { BottomNav } from '@/components/customer/BottomNav';
import { CUSTOMER_CLOSED_PATH, CUSTOMER_JOIN_PATH } from '@/lib/routes';

// join/closed have no session yet — no nav to show.
const NO_NAV_PATHS = [CUSTOMER_JOIN_PATH, CUSTOMER_CLOSED_PATH];

// liff.init() can legitimately hang forever in an external (non-LINE-app) browser —
// e.g. mid-redirect to LINE's login page never completing — so this can't just await
// indefinitely; a timeout turns a silent infinite skeleton into a visible, retryable error.
const LIFF_INIT_TIMEOUT_MS = 8000;

type Status = 'loading' | 'needsLogin' | 'error' | 'ready';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showNav = !NO_NAV_PATHS.some((p) => pathname.startsWith(p));
  const [status, setStatus] = useState<Status>('loading');
  const [liffError, setLiffError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timedOut = false;

    const timeoutId = setTimeout(() => {
      timedOut = true;
      if (!cancelled) {
        setLiffError('เชื่อมต่อ LINE ไม่สำเร็จ (หมดเวลา) — ลองสแกนผ่านแอป LINE โดยตรงแทนเบราว์เซอร์ทั่วไป');
        setStatus('error');
      }
    }, LIFF_INIT_TIMEOUT_MS);

    liffService
      .init()
      .then(() => {
        if (cancelled || timedOut) return;
        // login is a deliberate tap now (see src/lib/liff/real.ts) — init() alone never
        // redirects, so there's no loop risk here regardless of isLoggedIn()'s result.
        setStatus(liffService.isLoggedIn() ? 'ready' : 'needsLogin');
      })
      .catch((err) => {
        console.error('LIFF init failed', err);
        if (!cancelled && !timedOut) {
          setLiffError(err instanceof Error ? err.message : 'เชื่อมต่อ LINE ไม่สำเร็จ');
          setStatus('error');
        }
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [attempt]);

  let content: ReactNode;
  if (status === 'error') {
    content = (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 bg-customer-bg p-6 text-center">
        <div className="text-4xl">😕</div>
        <p className="text-sm text-customer-text-primary">{liffError}</p>
        <Button
          variant="secondary"
          onClick={() => {
            setLiffError(null);
            setAttempt((a) => a + 1);
          }}
        >
          ลองใหม่
        </Button>
      </div>
    );
  } else if (status === 'needsLogin') {
    content = (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 bg-customer-bg p-6 text-center">
        <div className="text-4xl">🔐</div>
        <p className="text-sm text-customer-text-primary">กรุณาเข้าสู่ระบบด้วย LINE เพื่อเข้าร่วมโต๊ะ</p>
        <Button onClick={() => liffService.triggerLogin()}>เข้าสู่ระบบด้วย LINE</Button>
      </div>
    );
  } else if (status === 'loading') {
    content = (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-3 bg-customer-bg">
        <Skeleton className="h-4 w-32" />
      </div>
    );
  } else {
    content = (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-customer-bg">
        <div className={showNav ? 'flex-1 pb-16' : 'flex-1'}>{children}</div>
        {showNav && <BottomNav />}
      </div>
    );
  }

  return (
    <>
      {content}
      <Toaster position="top-center" />
    </>
  );
}
