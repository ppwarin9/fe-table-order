'use client';

import { useState } from 'react';
import { useDailyReport } from '@/hooks/queries/useAdminDashboard';
import { formatTHB } from '@/lib/billing/money';
import { todayISODate } from '@/lib/utils/date';
import { RequireRole } from '@/components/admin/RequireRole';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';

export default function AdminReportsPage() {
  return (
    <RequireRole role="ADMIN">
      <ReportsContent />
    </RequireRole>
  );
}

function ReportsContent() {
  const [date, setDate] = useState(todayISODate());
  const query = useDailyReport(date);
  const report = query.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold">รายงานยอดขาย</h1>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
      </div>

      {query.error ? (
        <QueryErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : query.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">ยอดขายรวม</p>
              <p className="text-2xl font-semibold">{report ? formatTHB(report.totalRevenue) : '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">จำนวนบิลที่ปิด</p>
              <p className="text-2xl font-semibold">{report ? String(report.totalOrders) : '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">รอบออเดอร์ที่ส่ง</p>
              <p className="text-2xl font-semibold">{report ? String(report.orderCount) : '—'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">เมนูขายดี</h2>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-2xl">📊</p>
          <p className="text-sm">ยังไม่มีข้อมูลแยกยอดขายรายเมนู มีแต่ยอดรวมทั้งวัน</p>
        </div>
      </section>
    </div>
  );
}
