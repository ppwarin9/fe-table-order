'use client';

import Link from 'next/link';
import { useActiveSessions, useDailyReport } from '@/hooks/queries/useAdminDashboard';
import { useAdminOrderQueue } from '@/hooks/queries/useAdminOrderQueue';
import { useAdminTables } from '@/hooks/queries/useAdminTables';
import { formatTHB } from '@/lib/billing/money';
import { todayISODate } from '@/lib/utils/date';
import { RequireRole } from '@/components/admin/RequireRole';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { cn } from '@/lib/utils';
import type { ActiveSessionView } from '@/lib/api/contract';

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireRole role="ADMIN">
      <DashboardContent />
    </RequireRole>
  );
}

// Longest still-outstanding item's remaining estimate — cooking items count down from
// when they actually started, pending items haven't started yet so use the full estimate.
function estimateWaitMinutes(queue: { status: string; startedAt: string | null; estimatedMinutes: number }[]): number {
  const remaining = queue.map((item) => {
    if (item.status === 'cooking' && item.startedAt) {
      const elapsed = (Date.now() - new Date(item.startedAt).getTime()) / 60_000;
      return Math.max(0, Math.round(item.estimatedMinutes - elapsed));
    }
    return item.estimatedMinutes;
  });
  return remaining.length > 0 ? Math.max(...remaining) : 0;
}

function tableStatus(session: ActiveSessionView): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
  if (session.openBillAmount !== null) return { label: 'รอชำระ', variant: 'destructive' };
  if (session.cookingItemCount > 0) return { label: 'กำลังทำ', variant: 'default' };
  if (session.pendingItemCount > 0) return { label: 'กำลังสั่ง', variant: 'secondary' };
  return { label: 'นั่งแล้ว', variant: 'secondary' };
}

function minutesAgo(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
}

function DashboardContent() {
  const sessionsQuery = useActiveSessions();
  const reportQuery = useDailyReport(todayISODate());
  const tablesQuery = useAdminTables();
  const queueQuery = useAdminOrderQueue(false);

  const sessions = sessionsQuery.data ?? [];
  const report = reportQuery.data ?? null;
  const totalTables = tablesQuery.data?.length ?? null;
  const waitMinutes = estimateWaitMinutes(queueQuery.data ?? []);

  if (sessionsQuery.error) {
    return <QueryErrorState message={sessionsQuery.error.message} onRetry={() => sessionsQuery.refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">ภาพรวมวันนี้</h1>

      {sessionsQuery.isPending || reportQuery.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="โต๊ะที่ใช้งาน"
            value={totalTables !== null ? `${sessions.length}/${totalTables}` : String(sessions.length)}
            hint="โต๊ะที่เปิดอยู่ / ทั้งหมด"
          />
          <StatCard
            label="รายการค้างเสิร์ฟ"
            value={String(sessions.reduce((sum, s) => sum + s.pendingItemCount, 0))}
            hint="รวมทุกโต๊ะที่เปิดอยู่"
          />
          <StatCard
            label="เวลารอโดยประมาณ"
            value={queueQuery.isPending ? '—' : `${waitMinutes} นาที`}
            hint="รายการที่รอนานที่สุดในคิว"
          />
          <StatCard
            label="ยอดขายวันนี้"
            value={report ? formatTHB(report.totalRevenue) : '—'}
            hint={report ? `${report.totalOrders} บิลที่ปิดแล้ว · ${report.orderCount} รอบออเดอร์` : undefined}
          />
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">โต๊ะที่เปิดอยู่</h2>
        {sessionsQuery.isPending ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีลูกค้าในร้านตอนนี้</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {sessions.map((s) => {
              const status = tableStatus(s);
              return (
                <Link
                  key={s.sessionId}
                  href="/admin/billing"
                  className={cn(
                    'flex flex-col gap-1.5 rounded-xl border bg-card p-3 shadow-sm hover:border-primary',
                    status.variant === 'destructive' ? 'border-red-200' : 'border-border',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold">โต๊ะ {s.tableNumber}</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.memberCount} คน · นั่งมา {minutesAgo(s.openedAt)} นาที
                  </p>
                  {s.cookingItemCount > 0 && (
                    <p className="text-xs text-muted-foreground">{s.cookingItemCount} รายการกำลังทำ</p>
                  )}
                  {s.openBillAmount !== null && (
                    <p className="text-sm font-semibold text-red-600">{formatTHB(s.openBillAmount)}</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
