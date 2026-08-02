'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateMenuItem } from '@/hooks/mutations/useMenuItemMutations';
import { RequireRole } from '@/components/admin/RequireRole';
import { MenuForm, type MenuFormValues } from '@/components/admin/MenuForm';
import { ADMIN_MENU_PATH } from '@/lib/routes';

export default function AdminMenuNewPage() {
  return (
    <RequireRole role="ADMIN">
      <MenuNewContent />
    </RequireRole>
  );
}

function MenuNewContent() {
  const router = useRouter();
  const createMenuItem = useCreateMenuItem();

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      await createMenuItem.mutateAsync(values);
      toast.success('เพิ่มเมนูแล้ว');
      router.push(ADMIN_MENU_PATH);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'เพิ่มเมนูไม่สำเร็จ');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">เพิ่มเมนูใหม่</h1>
      <MenuForm onSubmit={handleSubmit} submitLabel="เพิ่มเมนู" />
    </div>
  );
}
