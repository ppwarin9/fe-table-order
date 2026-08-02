'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAdminOrderQueue } from '@/hooks/queries/useAdminOrderQueue';
import { useUpdateOrderItemStatus } from '@/hooks/mutations/useAdminOrderQueueMutations';
import type { AdminOrderItemView } from '@/lib/api/contract';
import type { OrderItemStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

type Filter = 'active' | 'all';

// Backend enforces PENDING → COOKING → SERVED strictly forward-only, no reordering — a
// simple "next status" button per item matches that model exactly.
const NEXT_STATUS: Partial<Record<OrderItemStatus, OrderItemStatus>> = {
  pending: 'cooking',
  cooking: 'served',
};
const NEXT_LABEL: Record<OrderItemStatus, string> = {
  pending: 'เริ่มทำ',
  cooking: 'เสิร์ฟแล้ว',
  served: '',
};
const STATUS_LABEL: Record<OrderItemStatus, string> = {
  pending: 'รอคิว',
  cooking: 'กำลังทำ',
  served: 'เสิร์ฟแล้ว',
};

function groupByTable(items: AdminOrderItemView[]) {
  const groups = new Map<string, { tableNumber: string; items: AdminOrderItemView[] }>();
  for (const item of items) {
    const key = `${item.tableSessionId}:${item.roundNumber}`;
    const group = groups.get(key) ?? { tableNumber: item.tableNumber, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  return [...groups.entries()].sort(([, a], [, b]) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
}

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<Filter>('active');
  const query = useAdminOrderQueue(filter === 'all');
  const updateStatus = useUpdateOrderItemStatus();
  const [busyItemIds, setBusyItemIds] = useState<Set<string>>(new Set());

  const groups = useMemo(() => groupByTable(query.data ?? []), [query.data]);

  const handleAdvance = async (item: AdminOrderItemView) => {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    setBusyItemIds((prev) => new Set(prev).add(item.id));
    try {
      await updateStatus.mutateAsync({ orderItemId: item.id, status: next });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกสถานะไม่สำเร็จ');
    } finally {
      setBusyItemIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">คิวออเดอร์</h1>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="active">ยังไม่เสร็จ</TabsTrigger>
            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {query.isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : query.error ? (
        <p className="text-sm text-destructive">{query.error.message}</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">ไม่มีรายการในคิว</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {groups.map(([key, group]) => (
            <div key={key} className="rounded-xl border border-border bg-card p-3">
              <p className="mb-2 font-semibold">โต๊ะ {group.tableNumber}</p>
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {item.nameSnapshot} × {item.quantity}
                      </p>
                      {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                      <Badge variant="secondary" className="mt-1">
                        {STATUS_LABEL[item.status]}
                      </Badge>
                    </div>
                    {NEXT_STATUS[item.status] && (
                      <Button
                        size="sm"
                        disabled={busyItemIds.has(item.id)}
                        onClick={() => handleAdvance(item)}
                      >
                        {NEXT_LABEL[item.status]}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
