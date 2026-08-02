'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminRoles } from '@/hooks/queries/useAdminStaff';
import type { StaffUser } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Password is required on create, but the backend's UpdateStaffUserDto omits it entirely
// (no reset-password flow exists yet) — editing an existing staff user never touches it.
function buildSchema(isEditing: boolean) {
  return z.object({
    name: z.string().trim().min(1, 'กรุณากรอกชื่อ'),
    email: z.string().trim().min(1, 'กรุณากรอกอีเมล').email('อีเมลไม่ถูกต้อง'),
    password: isEditing ? z.string().optional() : z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    roleId: z.string().min(1, 'กรุณาเลือกสิทธิ์'),
  });
}

type StaffFormSchema = z.infer<ReturnType<typeof buildSchema>>;

export interface StaffFormValues {
  name: string;
  email: string;
  roleId: string;
  password?: string;
}

interface StaffFormProps {
  initial?: StaffUser;
  onSubmit: (values: StaffFormValues) => Promise<void>;
  submitLabel: string;
}

export function StaffForm({ initial, onSubmit, submitLabel }: StaffFormProps) {
  const rolesQuery = useAdminRoles();
  const roles = rolesQuery.data ?? [];
  const isEditing = !!initial;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormSchema>({
    resolver: zodResolver(buildSchema(isEditing)),
    defaultValues: {
      name: initial?.name ?? '',
      email: initial?.email ?? '',
      roleId: initial?.roleId ?? '',
      password: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      email: values.email,
      roleId: values.roleId,
      ...(values.password ? { password: values.password } : {}),
    });
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">ชื่อ</label>
        <Input aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">อีเมล</label>
        <Input type="email" aria-invalid={!!errors.email} {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      {!isEditing && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">รหัสผ่าน</label>
          <Input type="password" aria-invalid={!!errors.password} {...register('password')} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">สิทธิ์ (Role)</label>
        <Controller
          control={control}
          name="roleId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={rolesQuery.isPending}>
              <SelectTrigger className="w-full" aria-invalid={!!errors.roleId}>
                <SelectValue placeholder="เลือกสิทธิ์" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.roleId && <p className="text-xs text-destructive">{errors.roleId.message}</p>}
        {rolesQuery.error && <p className="text-xs text-destructive">โหลดสิทธิ์ไม่สำเร็จ: {rolesQuery.error.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting || rolesQuery.isPending}>
        {isSubmitting ? 'กำลังบันทึก...' : submitLabel}
      </Button>
    </form>
  );
}
