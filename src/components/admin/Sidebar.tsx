'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
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
  KeyRound,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ADMIN_LOGIN_PATH } from '@/lib/routes';
import { useAdminOrderQueue } from '@/hooks/queries/useAdminOrderQueue';
import { useChangeOwnPassword } from '@/hooks/mutations/useAdminStaffMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const links: NavLink[] = [
  { href: '/admin', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'ออเดอร์', icon: ChefHat },
  { href: '/admin/billing', label: 'เช็คบิล / ปิดโต๊ะ', icon: ReceiptText },
  { href: '/admin/tables', label: 'โต๊ะ & QR', icon: QrCode },
  { href: '/admin/menu', label: 'เมนูอาหาร', icon: UtensilsCrossed },
  { href: '/admin/reports', label: 'รายงานยอดขาย', icon: ChartColumnIncreasing },
  { href: '/admin/settings', label: 'ตั้งค่าร้าน', icon: Settings },
  // ADMIN-or-above only — filtered below by session.user.role.
  { href: '/admin/staff', label: 'พนักงาน', icon: Users, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const staffName = session?.user?.name ?? '—';
  const staffEmail = session?.user?.email ?? '';
  const handleSignOut = () => signOut({ callbackUrl: ADMIN_LOGIN_PATH });

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const changePassword = useChangeOwnPassword();

  const handleChangePassword = async () => {
    if (newPassword.length < 8) return;
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast.success('เปลี่ยนรหัสผ่านแล้ว');
      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    }
  };

  // Active (not-yet-served) queue count — badged on the orders link, same idea as the
  // customer bottom nav's cart/orders dots.
  const orderQueueQuery = useAdminOrderQueue(false);
  const pendingOrderCount = orderQueueQuery.data?.length ?? 0;
  const badgeCountFor = (href: string) => (href === '/admin/orders' ? pendingOrderCount : 0);

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
          .filter((link) => !link.adminOnly || session?.user?.role !== 'STAFF')
          .map((link) => {
            const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            const Icon = link.icon;
            const count = badgeCountFor(link.href);
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
                {count > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
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
          onClick={() => setPasswordDialogOpen(true)}
          aria-label="เปลี่ยนรหัสผ่าน"
          title="เปลี่ยนรหัสผ่าน"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <KeyRound className="size-4" />
        </button>
        <button
          onClick={handleSignOut}
          aria-label="ออกจากระบบ"
          title="ออกจากระบบ"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
        </button>
      </div>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) {
            setCurrentPassword('');
            setNewPassword('');
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">รหัสผ่านปัจจุบัน</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={!currentPassword || newPassword.length < 8 || changePassword.isPending}
            >
              {changePassword.isPending ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
