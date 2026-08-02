'use client';

import { useOrders } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatTHB } from '@/lib/billing/money';
import type { OrderItemStatus } from '@/lib/types';

const STATUS_LABEL: Record<OrderItemStatus, string> = {
  pending: 'รอคิว',
  cooking: 'กำลังทำ',
  served: 'เสิร์ฟแล้ว',
};

const STATUS_VARIANT: Record<OrderItemStatus, 'secondary' | 'default'> = {
  pending: 'secondary',
  cooking: 'default',
  served: 'secondary',
};

export default function OrdersPage() {
  const { rounds, loading, error } = useOrders();

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="p-4 text-sm text-destructive">{error.message}</p>;
  }

  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-16 text-center text-muted-foreground">
        <p className="text-3xl">📋</p>
        <p className="text-sm">ยังไม่มีออเดอร์ที่สั่งไป</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold">ออเดอร์ของโต๊ะนี้</h1>
      {[...rounds].reverse().map((round) => (
        <div key={round.id} className="rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-sm font-medium">รอบที่ {round.roundNumber}</p>
          <div className="flex flex-col gap-2">
            {round.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex-1">
                  <p>
                    {item.nameSnapshot} × {item.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.addedByName} · {formatTHB(item.unitPriceSnapshot * item.quantity)}
                  </p>
                  {item.note && <p className="text-xs text-muted-foreground">หมายเหตุ: {item.note}</p>}
                </div>
                <Badge variant={STATUS_VARIANT[item.status]}>{STATUS_LABEL[item.status]}</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
