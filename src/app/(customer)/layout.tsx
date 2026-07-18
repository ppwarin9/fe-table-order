'use client';

import type { ReactNode } from 'react';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-customer-bg font-tl">
      <div className="flex-1">{children}</div>
    </div>
  );
}
