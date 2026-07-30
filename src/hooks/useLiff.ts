'use client';

import { useContext } from 'react';
import { LiffContext } from '@/lib/liff/LiffProvider';

export const useLiff = () => {
  const context = useContext(LiffContext);

  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider');
  }

  return context;
};
