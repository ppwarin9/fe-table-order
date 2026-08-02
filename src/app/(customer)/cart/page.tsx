'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTHB } from '@/lib/billing/money';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, error, updateQty, removeItem } = useCart();
  const { submitRound } = useOrders();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitRound();
      toast.success('ส่งออเดอร์แล้ว');
      router.push('/orders');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ส่งออเดอร์ไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="p-4 text-sm text-destructive">{error.message}</p>;
  }

  const items = cart?.items ?? [];

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      <h1 className="text-lg font-semibold">ตะกร้า</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <p className="text-3xl">🛒</p>
          <p className="text-sm">ยังไม่มีรายการในตะกร้า</p>
          <Button variant="secondary" onClick={() => router.push('/menu')}>
            ไปเลือกเมนู
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-sm font-medium">{item.menuName}</p>
                {item.note && <p className="text-xs text-muted-foreground">หมายเหตุ: {item.note}</p>}
                <p className="text-xs text-muted-foreground">เพิ่มโดย {item.addedByName}</p>
                <p className="text-sm font-semibold text-primary">{formatTHB(item.unitPrice * item.quantity)}</p>
              </div>
              <div className="flex flex-col items-end justify-between gap-2">
                <button
                  onClick={() => removeItem(item.id).catch((e) => toast.error(e.message))}
                  className="text-muted-foreground"
                  aria-label="ลบรายการ"
                >
                  <Trash2 className="size-4" />
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateQty(item.id, item.quantity - 1).catch((e) => toast.error(e.message))}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateQty(item.id, item.quantity + 1).catch((e) => toast.error(e.message))}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 mx-auto w-full max-w-md border-t border-border bg-background p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">รวม {cart?.totalQuantity} รายการ</span>
            <span className="font-semibold">{formatTHB(cart?.totalAmount ?? 0)}</span>
          </div>
          <Button className="w-full" size="lg" disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'กำลังส่งออเดอร์...' : 'ยืนยันสั่งอาหาร'}
          </Button>
        </div>
      )}
    </div>
  );
}
