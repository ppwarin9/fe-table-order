'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminMenuCategories } from '@/hooks/queries/useAdminMenu';
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/mutations/useCategoryMutations';
import { RequireRole } from '@/components/admin/RequireRole';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCategoriesPage() {
  return (
    <RequireRole role="ADMIN">
      <CategoriesContent />
    </RequireRole>
  );
}

function CategoriesContent() {
  const categoriesQuery = useAdminMenuCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState('');

  const categories = categoriesQuery.data ?? [];

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createCategory.mutateAsync({ name: trimmed, sortOrder: categories.length });
      setName('');
      toast.success('เพิ่มหมวดหมู่แล้ว');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'เพิ่มหมวดหมู่ไม่สำเร็จ');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCategory.mutateAsync({ id, input: { isActive } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast.success(`ลบหมวดหมู่ "${categoryName}" แล้ว`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ลบไม่สำเร็จ — อาจยังมีเมนูอยู่ในหมวดนี้');
    }
  };

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-semibold">หมวดหมู่เมนู</h1>

      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="ชื่อหมวดหมู่ใหม่"
        />
        <Button disabled={!name.trim() || createCategory.isPending} onClick={handleCreate}>
          เพิ่ม
        </Button>
      </div>

      {categoriesQuery.isPending ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{category.name}</p>
              <div className="flex items-center gap-3">
                <Switch checked={category.isActive} onCheckedChange={(v) => handleToggleActive(category.id, v)} />
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
