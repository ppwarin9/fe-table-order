'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { useAdminTables } from '@/hooks/queries/useAdminTables';
import { useActiveSessions } from '@/hooks/queries/useAdminDashboard';
import { useCreateTable, useDeleteTable, useRegenerateQr } from '@/hooks/mutations/useAdminTableMutations';
import type { DiningTable } from '@/lib/types';
import { RequireRole } from '@/components/admin/RequireRole';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { env } from '@/config/env';

export default function AdminTablesPage() {
  return (
    <RequireRole role="ADMIN">
      <TablesContent />
    </RequireRole>
  );
}

function TablesContent() {
  const tablesQuery = useAdminTables();
  const sessionsQuery = useActiveSessions();
  const createTable = useCreateTable();
  const deleteTable = useDeleteTable();
  const regenerateQr = useRegenerateQr();

  const [newNumber, setNewNumber] = useState('');
  const [qrTable, setQrTable] = useState<DiningTable | null>(null);

  const tables = tablesQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];
  const occupiedTableIds = new Set(sessions.map((s) => s.tableId));

  const handleCreate = async () => {
    if (!newNumber.trim()) return;
    try {
      await createTable.mutateAsync(newNumber.trim());
      setNewNumber('');
      toast.success('เพิ่มโต๊ะแล้ว');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'เพิ่มโต๊ะไม่สำเร็จ');
    }
  };

  const handleDelete = async (table: DiningTable) => {
    try {
      await deleteTable.mutateAsync(table.id);
      toast.success(`ลบโต๊ะ ${table.tableNumber} แล้ว`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ลบโต๊ะไม่สำเร็จ — โต๊ะนี้อาจมี session อยู่');
    }
  };

  const handleRegenerate = async (table: DiningTable) => {
    try {
      const updated = await regenerateQr.mutateAsync(table.id);
      setQrTable(updated);
      toast.success('สร้าง QR ใหม่แล้ว — QR เดิมใช้ไม่ได้อีกต่อไป');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'สร้าง QR ใหม่ไม่สำเร็จ');
    }
  };

  // Must be a liff.line.me URL, not a raw Vercel URL — only a LIFF URL launches the page
  // inside the real LIFF context (isInClient() true, liff.login()'s redirect round-trip
  // works). LINE resolves this to `<LIFF app's Endpoint URL>/join?t=<qrToken>`, so the
  // Endpoint URL registered in the LINE Developers Console must be the site's root
  // (e.g. https://fe-table-order.vercel.app), never a sub-path like /menu.
  const joinUrl = (qrToken: string) => `https://liff.line.me/${env.NEXT_PUBLIC_LIFF_ID}/join?t=${qrToken}`;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">โต๊ะ & QR Code</h1>

      <div className="flex max-w-sm items-end gap-2">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium">เพิ่มโต๊ะใหม่</label>
          <Input
            placeholder="หมายเลขโต๊ะ เช่น 9"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <Button onClick={handleCreate} disabled={!newNumber.trim() || createTable.isPending}>
          เพิ่มโต๊ะ
        </Button>
      </div>

      {tablesQuery.isPending ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : tablesQuery.error ? (
        <p className="text-sm text-destructive">{tablesQuery.error.message}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {tables.map((table) => (
            <div key={table.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <p className="font-bold">โต๊ะ {table.tableNumber}</p>
                {occupiedTableIds.has(table.id) ? (
                  <Badge>มีลูกค้า</Badge>
                ) : (
                  <Badge variant="secondary">ว่าง</Badge>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => setQrTable(table)}>
                ดู QR
              </Button>
              <button
                onClick={() => handleDelete(table)}
                className="text-xs font-medium text-destructive hover:underline"
              >
                ลบโต๊ะ
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!qrTable} onOpenChange={(open) => !open && setQrTable(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR โต๊ะ {qrTable?.tableNumber}</DialogTitle>
          </DialogHeader>
          {qrTable && (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-white p-3">
                <QRCodeSVG value={joinUrl(qrTable.qrToken)} size={192} />
              </div>
              <p className="break-all text-center text-xs text-muted-foreground">{joinUrl(qrTable.qrToken)}</p>
              <Button
                variant="destructive"
                size="sm"
                disabled={regenerateQr.isPending}
                onClick={() => handleRegenerate(qrTable)}
              >
                สร้าง QR ใหม่ (QR เดิมจะใช้ไม่ได้)
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
