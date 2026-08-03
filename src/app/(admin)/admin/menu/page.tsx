'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAdminMenuCategories, useAdminMenuItems } from '@/hooks/queries/useAdminMenu';
import { useCreateMenuItem, useDeleteMenuItem, useUpdateMenuItem } from '@/hooks/mutations/useMenuItemMutations';
import { formatTHB } from '@/lib/billing/money';
import type { MenuItem } from '@/lib/types';
import { RequireRole } from '@/components/admin/RequireRole';
import { MenuForm, type MenuFormValues } from '@/components/admin/MenuForm';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AdminMenuPage() {
  return (
    <RequireRole role="ADMIN">
      <MenuListContent />
    </RequireRole>
  );
}

function MenuListContent() {
  const categoriesQuery = useAdminMenuCategories();
  const itemsQuery = useAdminMenuItems();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const categories = categoriesQuery.data ?? [];
  const items = itemsQuery.data ?? [];

  const openCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const toggleAvailable = async (item: MenuItem, isAvailable: boolean) => {
    try {
      await updateMenuItem.mutateAsync({ id: item.id, input: { isAvailable } });
      toast.success(isAvailable ? 'เปิดขายแล้ว' : 'ปิดขายชั่วคราว');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    }
  };

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      if (editingItem) {
        await updateMenuItem.mutateAsync({ id: editingItem.id, input: values });
        toast.success('บันทึกแล้ว');
      } else {
        await createMenuItem.mutateAsync(values);
        toast.success('เพิ่มเมนูแล้ว');
      }
      setFormOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    }
  };

  const handleDelete = async (item: MenuItem) => {
    try {
      await deleteMenuItem.mutateAsync(item.id);
      toast.success(`ลบ "${item.name}" แล้ว`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ลบไม่สำเร็จ');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">เมนูอาหาร</h1>
        <div className="flex gap-2">
          <Link href="/admin/menu/categories">
            <Button variant="secondary">จัดการหมวดหมู่</Button>
          </Link>
          <Button onClick={openCreate}>+ เพิ่มเมนู</Button>
        </div>
      </div>

      {itemsQuery.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : itemsQuery.error ? (
        <QueryErrorState message={itemsQuery.error.message} onRetry={() => itemsQuery.refetch()} />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีเมนู</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="p-3">เมนู</th>
                <th className="p-3">ราคา</th>
                <th className="p-3">เวลาปรุง</th>
                <th className="p-3">พร้อมขาย</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="p-3">
                    <button onClick={() => openEdit(item)} className="flex items-center gap-3 text-left">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt="" className="h-10 w-14 rounded-md object-cover" />
                      <div>
                        <p className="font-medium hover:underline">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {categories.find((c) => c.id === item.categoryId)?.name ?? '—'}
                        </p>
                      </div>
                    </button>
                  </td>
                  <td className="p-3">{formatTHB(item.price)}</td>
                  <td className="p-3">{item.estimatedCookingMinutes} นาที</td>
                  <td className="p-3">
                    <Switch checked={item.isAvailable} onCheckedChange={(v) => toggleAvailable(item, v)} />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</DialogTitle>
            {editingItem && <DialogDescription>แก้ไขรายละเอียดของ &ldquo;{editingItem.name}&rdquo;</DialogDescription>}
          </DialogHeader>
          <MenuForm
            initial={editingItem ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
            submitLabel={editingItem ? 'บันทึก' : 'เพิ่มเมนู'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
