'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ChefHat,
  ReceiptText,
  QrCode,
  UtensilsCrossed,
  ChartColumnIncreasing,
  Settings,
  Users,
  LogOut,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ADMIN_LOGIN_PATH } from '@/lib/routes';

interface NavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  superAdminOnly?: boolean;
}

const links: NavLink[] = [
  { href: '/admin', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'ออเดอร์', icon: ChefHat },
  { href: '/admin/billing', label: 'เช็คบิล / ปิดโต๊ะ', icon: ReceiptText },
  { href: '/admin/tables', label: 'โต๊ะ & QR', icon: QrCode },
  { href: '/admin/menu', label: 'เมนูอาหาร', icon: UtensilsCrossed },
  { href: '/admin/reports', label: 'รายงานยอดขาย', icon: ChartColumnIncreasing },
  { href: '/admin/settings', label: 'ตั้งค่าร้าน', icon: Settings },
  // SUPERADMIN only — filtered below by session.user.role.
  { href: '/admin/staff', label: 'พนักงาน', icon: Users, superAdminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const staffName = session?.user?.name ?? '—';
  const staffEmail = session?.user?.email ?? '';
  const handleSignOut = () => signOut({ callbackUrl: ADMIN_LOGIN_PATH });

  return (
    <aside className="flex h-dvh w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 border-b border-border p-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <QrCode className="size-5" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight">TableLink</p>
          <p className="text-xs text-muted-foreground">ระบบหลังบ้าน</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {links
          .filter((link) => !link.superAdminOnly || session?.user?.role === 'SUPERADMIN')
          .map((link) => {
            const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-accent font-semibold text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4.5 shrink-0" strokeWidth={active ? 2.25 : 2} />
                <span className="flex-1">{link.label}</span>
              </Link>
            );
          })}
      </nav>
      <div className="flex items-center gap-2.5 border-t border-border p-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {staffName.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{staffName}</p>
          <p className="truncate text-xs text-muted-foreground">{staffEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          aria-label="ออกจากระบบ"
          title="ออกจากระบบ"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
