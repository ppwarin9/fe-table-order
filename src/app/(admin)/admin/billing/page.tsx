'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useActiveSessions } from '@/hooks/queries/useAdminDashboard';
import { useCloseSession } from '@/hooks/mutations/useAdminSessionMutations';
import { useAdminBillDetail } from '@/hooks/queries/useAdminBilling';
import { useSettleAdminBillShare } from '@/hooks/mutations/useAdminBillingMutations';
import type { ActiveSessionView } from '@/lib/api/contract';
import { formatTime } from '@/lib/utils/date';
import { formatTHB } from '@/lib/billing/money';
import { RequireRole } from '@/components/admin/RequireRole';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminBillingPage() {
  return (
    <RequireRole role="ADMIN">
      <BillingContent />
    </RequireRole>
  );
}

function BillingContent() {
  const { data: sessions, isPending, error } = useActiveSessions();
  const closeSession = useCloseSession();
  const [closingSession, setClosingSession] = useState<ActiveSessionView | null>(null);
  const [viewingSession, setViewingSession] = useState<ActiveSessionView | null>(null);

  const handleConfirmClose = async () => {
    if (!closingSession) return;
    try {
      await closeSession.mutateAsync(closingSession.sessionId);
      toast.success(`ปิดโต๊ะ ${closingSession.tableNumber} แล้ว`);
      setClosingSession(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ปิดโต๊ะไม่สำเร็จ');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">เช็คบิล / ปิดโต๊ะ</h1>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : !sessions || sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">ไม่มีโต๊ะที่เปิดอยู่ตอนนี้</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {sessions.map((session) => (
            <Card key={session.sessionId}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">โต๊ะ {session.tableNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.memberCount} คน · เปิดโต๊ะ {formatTime(session.openedAt)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{session.pendingItemCount} รายการค้างเสิร์ฟ</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => setViewingSession(session)}>
                    ดูรายละเอียดบิล
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setClosingSession(session)}>
                    ปิดโต๊ะ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!closingSession} onOpenChange={(open) => !open && setClosingSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ปิดโต๊ะ {closingSession?.tableNumber ?? ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              การปิดโต๊ะจะยกเลิก session ของลูกค้าทุกคนที่โต๊ะนี้ทันที ใช้เมื่อลูกค้าออกจากร้านแล้วเท่านั้น
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction disabled={closeSession.isPending} onClick={handleConfirmClose}>
              ปิดโต๊ะ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BillDetailDialog
        sessionId={viewingSession?.sessionId ?? null}
        tableNumber={viewingSession?.tableNumber ?? ''}
        onClose={() => setViewingSession(null)}
      />
    </div>
  );
}

function BillDetailDialog({
  sessionId,
  tableNumber,
  onClose,
}: {
  sessionId: string | null;
  tableNumber: string;
  onClose: () => void;
}) {
  const billQuery = useAdminBillDetail(sessionId);
  const settleShare = useSettleAdminBillShare(sessionId ?? '');

  const handleCash = async (shareId: string) => {
    try {
      await settleShare.mutateAsync({ shareId, method: 'cash' });
      toast.success('บันทึกการชำระเงินสดแล้ว');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกการชำระเงินไม่สำเร็จ');
    }
  };

  return (
    <Dialog open={!!sessionId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>บิลโต๊ะ {tableNumber}</DialogTitle>
        </DialogHeader>

        {billQuery.isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : billQuery.error ? (
          <p className="text-sm text-destructive">{billQuery.error.message}</p>
        ) : billQuery.data ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ยอดอาหาร</span>
                <span>{formatTHB(billQuery.data.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ค่าบริการ + VAT</span>
                <span>{formatTHB(billQuery.data.serviceChargeAmount + billQuery.data.vatAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-semibold">
                <span>รวมทั้งหมด</span>
                <span>{formatTHB(billQuery.data.grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {billQuery.data.shares.map((share) => (
                <div key={share.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                  <div>
                    <p className="text-sm font-medium">{share.label}</p>
                    <p className="text-xs text-muted-foreground">{formatTHB(share.amountDue)}</p>
                  </div>
                  {share.status === 'paid' ? (
                    <Badge variant="secondary">จ่ายแล้ว{share.method ? ` (${share.method === 'cash' ? 'เงินสด' : 'พร้อมเพย์'})` : ''}</Badge>
                  ) : (
                    <Button size="sm" disabled={settleShare.isPending} onClick={() => handleCash(share.id)}>
                      รับเงินสด
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              การยืนยันชำระผ่านพร้อมเพย์ ต้องให้ลูกค้าแจ้งชำระจากหน้าลูกค้าก่อน แล้วจึงยืนยันแยกต่างหาก (ยังไม่รองรับจากหน้านี้)
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">ยังไม่มีบิลสำหรับโต๊ะนี้</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
