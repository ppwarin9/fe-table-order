'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, ShoppingCart, ClipboardList, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CUSTOMER_MENU_PATH } from '@/lib/routes';

const ITEMS = [
  { href: CUSTOMER_MENU_PATH, label: 'เมนู', icon: UtensilsCrossed },
  { href: '/cart', label: 'ตะกร้า', icon: ShoppingCart },
  { href: '/orders', label: 'ออเดอร์', icon: ClipboardList },
  { href: '/bill', label: 'บิล', icon: Receipt },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md border-t border-border bg-background">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
