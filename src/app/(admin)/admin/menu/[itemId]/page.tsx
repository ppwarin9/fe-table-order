'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminMenuItem } from '@/hooks/queries/useAdminMenu';
import { useUpdateMenuItem } from '@/hooks/mutations/useMenuItemMutations';
import { RequireRole } from '@/components/admin/RequireRole';
import { MenuForm, type MenuFormValues } from '@/components/admin/MenuForm';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { ADMIN_MENU_PATH } from '@/lib/routes';

export default function AdminMenuEditPage() {
  return (
    <RequireRole role="ADMIN">
      <MenuEditContent />
    </RequireRole>
  );
}

function MenuEditContent() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();
  const { data: item, isPending, error, refetch } = useAdminMenuItem(itemId);
  const updateMenuItem = useUpdateMenuItem();

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      await updateMenuItem.mutateAsync({ id: itemId, input: values });
      toast.success('บันทึกแล้ว');
      router.push(ADMIN_MENU_PATH);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    }
  };

  if (error) {
    return <QueryErrorState message={error.message} onRetry={() => refetch()} />;
  }

  if (isPending || !item) {
    return <Skeleton className="h-80 max-w-lg" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">แก้ไขเมนู: {item.name}</h1>
      <MenuForm initial={item} onSubmit={handleSubmit} submitLabel="บันทึก" />
    </div>
  );
}
