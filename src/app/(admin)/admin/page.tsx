'use client';

import Link from 'next/link';
import { useActiveSessions, useDailyReport } from '@/hooks/queries/useAdminDashboard';
import { formatTHB } from '@/lib/billing/money';
import { todayISODate } from '@/lib/utils/date';
import { RequireRole } from '@/components/admin/RequireRole';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

function DashboardContent() {
  const sessionsQuery = useActiveSessions();
  const reportQuery = useDailyReport(todayISODate());

  const sessions = sessionsQuery.data ?? [];
  const report = reportQuery.data ?? null;

  if (sessionsQuery.error) {
    return <p className="text-sm text-destructive">{sessionsQuery.error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">ภาพรวมวันนี้</h1>

      {sessionsQuery.isPending || reportQuery.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="โต๊ะที่มีลูกค้า" value={String(sessions.length)} hint="session ที่เปิดอยู่" />
          <StatCard
            label="รายการค้างเสิร์ฟ"
            value={String(sessions.reduce((sum, s) => sum + s.pendingItemCount, 0))}
            hint="รวมทุกโต๊ะที่เปิดอยู่"
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
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีลูกค้าในร้านตอนนี้</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {sessions.map((s) => (
              <Link
                key={s.sessionId}
                href="/admin/billing"
                className="rounded-xl border border-border bg-card p-4 hover:border-primary"
              >
                <p className="font-bold">โต๊ะ {s.tableNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {s.memberCount} คน · {s.pendingItemCount} รายการค้างเสิร์ฟ
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
