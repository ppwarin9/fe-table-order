'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, ShoppingCart, ClipboardList, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CUSTOMER_MENU_PATH } from '@/lib/routes';
import { useSessionStore } from '@/stores/sessionStore';
import { useCartQuery } from '@/hooks/queries/useCart';
import { useRoundsQuery } from '@/hooks/queries/useRounds';

const ITEMS = [
  { href: CUSTOMER_MENU_PATH, label: 'เมนู', icon: UtensilsCrossed },
  { href: '/cart', label: 'ตะกร้า', icon: ShoppingCart },
  { href: '/orders', label: 'ออเดอร์', icon: ClipboardList },
  { href: '/bill', label: 'บิล', icon: Receipt },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { sessionId } = useSessionStore();
  const cartQuery = useCartQuery(sessionId);
  const roundsQuery = useRoundsQuery(sessionId);

  const cartCount = cartQuery.data?.totalQuantity ?? 0;
  const pendingOrderCount = (roundsQuery.data ?? [])
    .flatMap((round) => round.items)
    .filter((item) => item.status !== 'served').length;

  const badgeCountFor = (href: string) => {
    if (href === '/cart') return cartCount;
    if (href === '/orders') return pendingOrderCount;
    return 0;
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md border-t border-border bg-background">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const count = badgeCountFor(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <span className="relative">
              <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-medium text-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
