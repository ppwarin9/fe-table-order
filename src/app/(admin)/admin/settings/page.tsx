'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useStoreSetting, useUpdateStoreSetting } from '@/hooks/queries/useAdminSettings';
import type { SplitMethod, StoreSetting } from '@/lib/types';
import { RequireRole } from '@/components/admin/RequireRole';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { getErrorMessage } from '@/lib/api/live/http/normalizeError';

export default function AdminSettingsPage() {
  return (
    <RequireRole role="ADMIN">
      <SettingsContent />
    </RequireRole>
  );
}

function SettingsContent() {
  const query = useStoreSetting();

  if (query.error) {
    return <QueryErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  }

  if (query.isPending || !query.data) {
    return <Skeleton className="h-80 max-w-lg" />;
  }

  return <SettingsForm initial={query.data} />;
}

function SettingsForm({ initial }: { initial: StoreSetting }) {
  const updateSetting = useUpdateStoreSetting();
  const [draft, setDraft] = useState(initial);

  const update = (patch: Partial<StoreSetting>) => setDraft({ ...draft, ...patch });

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync(draft);
      toast.success('บันทึกการตั้งค่าแล้ว');
    } catch (e) {
      toast.error(getErrorMessage(e, 'บันทึกไม่สำเร็จ'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">ตั้งค่าร้าน</h1>

      <Card className="max-w-lg">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={draft.enableVat} onCheckedChange={(v) => update({ enableVat: v })} />
              <span className="text-sm">คิด VAT</span>
            </div>
            <Input
              type="number"
              min={0}
              step={0.01}
              className="w-24"
              value={String(draft.vatRate)}
              onChange={(e) => update({ vatRate: Number(e.target.value) || 0 })}
              disabled={!draft.enableVat}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={draft.enableServiceCharge}
                onCheckedChange={(v) => update({ enableServiceCharge: v })}
              />
              <span className="text-sm">คิดค่าบริการ (Service Charge)</span>
            </div>
            <Input
              type="number"
              min={0}
              step={0.01}
              className="w-24"
              value={String(draft.serviceChargeRate)}
              onChange={(e) => update({ serviceChargeRate: Number(e.target.value) || 0 })}
              disabled={!draft.enableServiceCharge}
            />
          </div>

          <p className="text-xs text-muted-foreground">อัตราเป็นทศนิยม เช่น 0.07 = 7%, 0.10 = 10%</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">สกุลเงิน</label>
              <Input value={draft.currency} onChange={(e) => update({ currency: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">เขตเวลา</label>
              <Input value={draft.timezone} onChange={(e) => update({ timezone: e.target.value })} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">วิธีแบ่งบิลเริ่มต้น</label>
            <Select
              value={draft.defaultSplitMethod}
              onValueChange={(v) => update({ defaultSplitMethod: v as SplitMethod })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">หารเท่ากัน</SelectItem>
                <SelectItem value="single_payer">คนเดียวจ่ายทั้งหมด</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button disabled={updateSetting.isPending} onClick={handleSave}>
            {updateSetting.isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
