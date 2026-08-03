'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useBill } from '@/hooks/useBill';
import { useSessionStore } from '@/stores/sessionStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { formatTHB } from '@/lib/billing/money';
import type { PaymentMethodCode, SplitMethod } from '@/lib/types';

export default function BillPage() {
  const { memberId } = useSessionStore();
  const { bill, loading, error, issueBill, payShare, refetch } = useBill();
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [issuing, setIssuing] = useState(false);
  const [payingShareId, setPayingShareId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <QueryErrorState message={error.message} onRetry={refetch} />
      </div>
    );
  }

  const handleIssue = async () => {
    setIssuing(true);
    try {
      await issueBill(splitMethod, splitMethod === 'single_payer' ? (memberId ?? undefined) : undefined);
      toast.success('ออกบิลแล้ว');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ออกบิลไม่สำเร็จ — อาจมีบิลค้างชำระอยู่แล้ว หรือยังไม่มีรายการที่คิดเงินได้');
    } finally {
      setIssuing(false);
    }
  };

  const handlePay = async (billShareId: string, method: PaymentMethodCode) => {
    setPayingShareId(billShareId);
    try {
      await payShare(billShareId, method);
      toast.success(method === 'cash' ? 'แจ้งชำระเงินสดแล้ว รอพนักงานยืนยัน' : 'แจ้งชำระแล้ว รอพนักงานยืนยัน');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'แจ้งชำระเงินไม่สำเร็จ');
    } finally {
      setPayingShareId(null);
    }
  };

  if (!bill) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-lg font-semibold">เรียกเก็บเงิน</h1>
        <p className="text-sm text-muted-foreground">ยังไม่มีบิลสำหรับโต๊ะนี้ เลือกวิธีหารบิลแล้วกดออกบิลได้เลย</p>

        <RadioGroup
          value={splitMethod}
          onValueChange={(v) => setSplitMethod(v as SplitMethod)}
          className="gap-2"
        >
          <label
            htmlFor="split-equal"
            className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
          >
            <RadioGroupItem value="equal" id="split-equal" />
            หารเท่ากันทุกคนในโต๊ะ
          </label>
          <label
            htmlFor="split-single"
            className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
          >
            <RadioGroupItem value="single_payer" id="split-single" />
            คนเดียวจ่ายทั้งหมด (คุณจะเป็นผู้จ่าย)
          </label>
        </RadioGroup>

        <Button onClick={handleIssue} disabled={issuing}>
          {issuing ? 'กำลังออกบิล...' : 'ออกบิล'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold">บิลของโต๊ะนี้</h1>

      <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">ยอดอาหาร</span>
          <span>{formatTHB(bill.bill.subtotal)}</span>
        </div>
        {bill.bill.serviceChargeAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">ค่าบริการ</span>
            <span>{formatTHB(bill.bill.serviceChargeAmount)}</span>
          </div>
        )}
        {bill.bill.vatAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT</span>
            <span>{formatTHB(bill.bill.vatAmount)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t border-border pt-1 font-semibold">
          <span>ยอดรวมทั้งหมด</span>
          <span>{formatTHB(bill.bill.grandTotal)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {bill.shares.map((share) => {
          const isSelf = share.sessionMemberId === memberId;
          const paid = share.status === 'paid';
          return (
            <div key={share.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div>
                <p className="text-sm font-medium">{isSelf ? 'คุณ' : share.memberName}</p>
                <p className="text-sm text-muted-foreground">{formatTHB(share.amountDue)}</p>
              </div>
              {paid ? (
                <Badge variant="secondary">จ่ายแล้ว</Badge>
              ) : share.notified ? (
                <Badge>รอยืนยัน</Badge>
              ) : isSelf ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={payingShareId === share.id}
                    onClick={() => handlePay(share.id, 'cash')}
                  >
                    เงินสด
                  </Button>
                  <Button size="sm" disabled={payingShareId === share.id} onClick={() => handlePay(share.id, 'promptpay')}>
                    พร้อมเพย์
                  </Button>
                </div>
              ) : (
                <Badge variant="secondary">ยังไม่จ่าย</Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
