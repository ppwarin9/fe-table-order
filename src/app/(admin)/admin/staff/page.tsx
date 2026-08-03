'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useAdminRoles, useAdminStaffUsers } from '@/hooks/queries/useAdminStaff';
import {
  useCreateStaffUser,
  useDeleteStaffUser,
  useUpdateRole,
  useUpdateStaffUser,
} from '@/hooks/mutations/useAdminStaffMutations';
import type { Role, StaffUser } from '@/lib/types';
import { RequireRole } from '@/components/admin/RequireRole';
import { StaffForm, type StaffFormValues } from '@/components/admin/StaffForm';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
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

type Tab = 'staff' | 'roles';

export default function AdminStaffPage() {
  return (
    <RequireRole role="SUPERADMIN">
      <StaffPageContent />
    </RequireRole>
  );
}

function StaffPageContent() {
  const [tab, setTab] = useState<Tab>('staff');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">พนักงานและสิทธิ์</h1>
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="staff">พนักงาน</TabsTrigger>
            <TabsTrigger value="roles">สิทธิ์ (Role)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === 'staff' ? <StaffTab /> : <RolesTab />}
    </div>
  );
}

const ROLE_VARIANT: Record<string, 'destructive' | 'default' | 'secondary'> = {
  SUPERADMIN: 'destructive',
  ADMIN: 'default',
  STAFF: 'secondary',
};

function StaffTab() {
  const { data: session } = useSession();
  const staffQuery = useAdminStaffUsers();
  const rolesQuery = useAdminRoles();
  const createStaff = useCreateStaffUser();
  const updateStaff = useUpdateStaffUser();
  const deleteStaff = useDeleteStaffUser();

  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffUser | null>(null);

  const staffList = staffQuery.data ?? [];
  const roles = rolesQuery.data ?? [];
  const myId = session?.user?.id;

  const roleLabel = (roleId: string) => roles.find((r) => r.id === roleId)?.name ?? '—';
  const roleCode = (roleId: string) => roles.find((r) => r.id === roleId)?.code;

  const openCreate = () => {
    setEditingStaff(null);
    setFormOpen(true);
  };

  const openEdit = (staff: StaffUser) => {
    setEditingStaff(staff);
    setFormOpen(true);
  };

  const handleSubmit = async (values: StaffFormValues) => {
    try {
      if (editingStaff) {
        await updateStaff.mutateAsync({
          id: editingStaff.id,
          input: { name: values.name, email: values.email, roleId: values.roleId },
        });
        toast.success('บันทึกแล้ว');
      } else {
        await createStaff.mutateAsync({
          name: values.name,
          email: values.email,
          roleId: values.roleId,
          password: values.password ?? '',
        });
        toast.success('เพิ่มพนักงานแล้ว');
      }
      setFormOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    }
  };

  const handleToggleActive = async (staff: StaffUser, isActive: boolean) => {
    try {
      await updateStaff.mutateAsync({ id: staff.id, input: { isActive } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStaff) return;
    try {
      await deleteStaff.mutateAsync(deletingStaff.id);
      toast.success(`ลบ "${deletingStaff.name}" แล้ว`);
      setDeletingStaff(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ลบไม่สำเร็จ');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>+ เพิ่มพนักงาน</Button>
      </div>

      {staffQuery.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : staffQuery.error ? (
        <QueryErrorState message={staffQuery.error.message} onRetry={() => staffQuery.refetch()} />
      ) : staffList.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีพนักงาน</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {staffList.map((staff) => {
            const isMe = staff.id === myId;
            return (
              <li
                key={staff.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {staff.name}
                    {isMe && <span className="text-xs font-normal text-muted-foreground">(คุณ)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{staff.email}</p>
                  <Badge variant={ROLE_VARIANT[roleCode(staff.roleId) ?? ''] ?? 'secondary'} className="mt-1">
                    {roleLabel(staff.roleId)}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={staff.isActive}
                    disabled={isMe || updateStaff.isPending}
                    onCheckedChange={(v) => handleToggleActive(staff, v)}
                  />
                  <Button variant="secondary" size="sm" onClick={() => openEdit(staff)}>
                    แก้ไข
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isMe}
                    title={isMe ? 'ลบบัญชีตัวเองไม่ได้' : undefined}
                    onClick={() => setDeletingStaff(staff)}
                  >
                    ลบ
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStaff ? `แก้ไขพนักงาน: ${editingStaff.name}` : 'เพิ่มพนักงาน'}</DialogTitle>
          </DialogHeader>
          <StaffForm
            initial={editingStaff ?? undefined}
            onSubmit={handleSubmit}
            submitLabel={editingStaff ? 'บันทึก' : 'เพิ่มพนักงาน'}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingStaff} onOpenChange={(open) => !open && setDeletingStaff(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบ {deletingStaff?.name ?? ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              พนักงานคนนี้จะไม่สามารถเข้าสู่ระบบได้อีก (soft-delete)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction disabled={deleteStaff.isPending} onClick={handleConfirmDelete}>
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RolesTab() {
  const rolesQuery = useAdminRoles();
  const updateRole = useUpdateRole();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [name, setName] = useState('');

  const roles = rolesQuery.data ?? [];

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setName(role.name);
  };

  const handleSave = async () => {
    if (!editingRole) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await updateRole.mutateAsync({ id: editingRole.id, name: trimmed });
      toast.success('บันทึกแล้ว');
      setEditingRole(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        สิทธิ์เป็นชุดตายตัว 3 ระดับ (SUPERADMIN/ADMIN/STAFF) แก้ได้แค่ชื่อที่แสดง เพิ่ม/ลบสิทธิ์ใหม่ไม่ได้
      </p>

      {rolesQuery.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : rolesQuery.error ? (
        <QueryErrorState message={rolesQuery.error.message} onRetry={() => rolesQuery.refetch()} />
      ) : (
        <ul className="flex max-w-lg flex-col gap-2">
          {roles.map((role) => (
            <li
              key={role.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Badge variant={ROLE_VARIANT[role.code] ?? 'secondary'}>{role.code}</Badge>
                <span className="text-sm font-medium">{role.name}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => openEdit(role)}>
                แก้ไขชื่อ
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>แก้ไขชื่อสิทธิ์: {editingRole?.code ?? ''}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">ชื่อที่แสดง</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={!name.trim() || updateRole.isPending}>
              {updateRole.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
