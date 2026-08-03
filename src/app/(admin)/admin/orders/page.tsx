'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock, ChefHat, PackageCheck } from 'lucide-react';
import { useAdminOrderQueue } from '@/hooks/queries/useAdminOrderQueue';
import { useUpdateOrderItemStatus } from '@/hooks/mutations/useAdminOrderQueueMutations';
import { useElapsedMinutes } from '@/hooks/useElapsedMinutes';
import type { AdminOrderItemView } from '@/lib/api/contract';
import type { OrderItemStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { cn } from '@/lib/utils';

type Filter = 'active' | 'all';

// Backend enforces PENDING → COOKING → SERVED strictly forward-only, no reordering —
// a simple "next status" button per item matches that model exactly (no drag-and-drop).
const NEXT_STATUS: Partial<Record<OrderItemStatus, OrderItemStatus>> = {
  pending: 'cooking',
  cooking: 'served',
};
const NEXT_LABEL: Record<OrderItemStatus, string> = {
  pending: 'เริ่มทำ',
  cooking: 'เสิร์ฟแล้ว',
  served: '',
};

const COLUMNS: {
  status: OrderItemStatus;
  label: string;
  icon: typeof CalendarClock;
  headerClass: string;
}[] = [
  { status: 'pending', label: 'รอคิว', icon: CalendarClock, headerClass: 'text-foreground' },
  { status: 'cooking', label: 'กำลังทำ', icon: ChefHat, headerClass: 'text-amber-600' },
  { status: 'served', label: 'เสิร์ฟแล้ว', icon: PackageCheck, headerClass: 'text-emerald-600' },
];

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<Filter>('active');
  const query = useAdminOrderQueue(filter === 'all');
  const updateStatus = useUpdateOrderItemStatus();
  const [busyItemIds, setBusyItemIds] = useState<Set<string>>(new Set());

  const columns = filter === 'all' ? COLUMNS : COLUMNS.filter((c) => c.status !== 'served');

  const itemsByStatus = useMemo(() => {
    const map = new Map<OrderItemStatus, AdminOrderItemView[]>();
    for (const item of query.data ?? []) {
      const list = map.get(item.status) ?? [];
      list.push(item);
      map.set(item.status, list);
    }
    return map;
  }, [query.data]);

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
        <div>
          <h1 className="text-2xl font-semibold">คิวออเดอร์</h1>
          <p className="text-sm text-muted-foreground">{(query.data ?? []).length} รายการที่แสดงอยู่</p>
        </div>
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
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : query.error ? (
        <QueryErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (
        <div className={cn('grid grid-cols-1 gap-4', columns.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
          {columns.map((column) => {
            const columnItems = itemsByStatus.get(column.status) ?? [];
            const Icon = column.icon;
            return (
              <div key={column.status} className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3">
                <div className="flex items-center justify-between px-1">
                  <div className={cn('flex items-center gap-1.5 font-semibold', column.headerClass)}>
                    <Icon className="size-4.5" />
                    {column.label}
                  </div>
                  <span className="flex size-6 items-center justify-center rounded-full bg-background text-xs font-semibold shadow-sm">
                    {columnItems.length}
                  </span>
                </div>

                {columnItems.length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">ไม่มีรายการ</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {columnItems.map((item) => (
                      <OrderItemCard
                        key={item.id}
                        item={item}
                        busy={busyItemIds.has(item.id)}
                        onAdvance={() => handleAdvance(item)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrderItemCard({
  item,
  busy,
  onAdvance,
}: {
  item: AdminOrderItemView;
  busy: boolean;
  onAdvance: () => void;
}) {
  const elapsed = useElapsedMinutes(item.status === 'cooking' && item.startedAt ? item.startedAt : item.submittedAt);
  const next = NEXT_STATUS[item.status];
  const urgent = item.status !== 'served' && elapsed >= item.estimatedMinutes;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">โต๊ะ {item.tableNumber}</p>
        {item.status !== 'served' && (
          <span className={cn('text-xs font-semibold tabular-nums', urgent ? 'text-red-600' : 'text-muted-foreground')}>
            {elapsed} นาที
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-sm">🍽️</div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {item.quantity}x {item.nameSnapshot}
          </p>
          {item.note && <p className="text-xs text-muted-foreground">-- {item.note}</p>}
        </div>
      </div>
      {next && (
        <Button size="sm" className="mt-1 w-full" disabled={busy} onClick={onAdvance}>
          {NEXT_LABEL[item.status]}
        </Button>
      )}
    </div>
  );
}
