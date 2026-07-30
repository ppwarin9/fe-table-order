'use client';

import React, { createContext, useEffect, useState } from 'react';
import { liffService } from '@/lib/liff';
import type { LineProfile } from '@/lib/types';

type LiffContextType = {
  profile: LineProfile | null;
  isReady: boolean;
};

export const LiffContext = createContext<LiffContextType>({
  profile: null,
  isReady: false,
});

export const LiffProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<LineProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ใช้ async/await จับ Error ด้วย try/catch แบบ Modern
    const setupLiff = async () => {
      try {
        await liffService.init();
        const userProfile = await liffService.getProfile();

        setProfile(userProfile);
        setIsReady(true);
      } catch (err) {
        console.error('Failed to load LIFF', err);
      }
    };

    setupLiff();
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        กำลังโหลดข้อมูลจาก LINE...
      </div>
    );
  }

  return (
    <LiffContext.Provider value={{ profile, isReady }}>
      {children}
    </LiffContext.Provider>
  );
};
