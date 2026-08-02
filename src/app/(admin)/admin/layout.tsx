'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { Toaster } from '@/components/ui/sonner';
import { ADMIN_LOGIN_PATH } from '@/lib/routes';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith(ADMIN_LOGIN_PATH);

  if (isLoginPage) {
    return (
      <div className="min-h-dvh bg-admin-bg">
        {children}
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-admin-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <Toaster position="top-center" />
    </div>
  );
}
