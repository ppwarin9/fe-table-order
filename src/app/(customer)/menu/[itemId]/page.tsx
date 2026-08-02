'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMenuItem } from '@/hooks/queries/useMenuItem';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTHB } from '@/lib/billing/money';
import { Minus, Plus, ChevronLeft } from 'lucide-react';

export default function MenuItemDetailPage() {
  const params = useParams<{ itemId: string }>();
  const router = useRouter();
  const itemQuery = useMenuItem(params.itemId);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (itemQuery.isPending) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (itemQuery.error || !itemQuery.data) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="text-sm text-destructive">{itemQuery.error?.message ?? 'ไม่พบเมนูนี้'}</p>
        <Button variant="secondary" onClick={() => router.back()}>
          ย้อนกลับ
        </Button>
      </div>
    );
  }

  const item = itemQuery.data;

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      await addItem({ menuItemId: item.id, quantity, note: note.trim() || undefined });
      toast.success('เพิ่มลงตะกร้าแล้ว');
      router.push('/menu');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'เพิ่มลงตะกร้าไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="relative aspect-square w-full bg-muted">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl">🍽️</div>
        )}
        <button
          onClick={() => router.back()}
          className="absolute left-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4">
        <div>
          <h1 className="text-lg font-semibold">{item.name}</h1>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <p className="text-xl font-bold text-primary">{formatTHB(item.price)}</p>

        {!item.isAvailable && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">เมนูนี้หมดชั่วคราว</p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">หมายเหตุ (ถ้ามี)</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย"
            maxLength={200}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">จำนวน</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-6 text-center font-medium">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity((q) => q + 1)}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-border bg-background p-4">
        <Button
          className="w-full"
          size="lg"
          disabled={!item.isAvailable || submitting}
          onClick={handleAdd}
        >
          {submitting ? 'กำลังเพิ่ม...' : `เพิ่มลงตะกร้า · ${formatTHB(item.price * quantity)}`}
        </Button>
      </div>
    </div>
  );
}
