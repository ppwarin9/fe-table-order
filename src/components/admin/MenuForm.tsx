'use client';

import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAdminMenuCategories } from '@/hooks/queries/useAdminMenu';
import { bahtToSatang, satangToBaht } from '@/lib/billing/money';
import type { MenuItem } from '@/lib/types';
import { ADMIN_MENU_PATH } from '@/lib/routes';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Mirrors the backend's CreateMenuItemDto/UpdateMenuItemDto constraints exactly, so
// invalid input is caught here with an inline message instead of a raw 400 after submit.
const menuFormSchema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อเมนู').max(100, 'ชื่อเมนูยาวเกินไป (ไม่เกิน 100 ตัวอักษร)'),
  description: z.string().trim().min(1, 'กรุณากรอกคำอธิบาย').max(300, 'คำอธิบายยาวเกินไป (ไม่เกิน 300 ตัวอักษร)'),
  priceBaht: z
    .string()
    .min(1, 'กรุณากรอกราคา')
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, 'ราคาต้องเป็นตัวเลขไม่ติดลบ'),
  imageUrl: z.union([z.literal(''), z.string().trim().url('ลิงก์รูปภาพไม่ถูกต้อง')]),
  categoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  minutes: z
    .string()
    .min(1, 'กรุณากรอกเวลาปรุง')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, 'เวลาปรุงต้องเป็นจำนวนเต็มตั้งแต่ 1 นาทีขึ้นไป'),
});

type MenuFormSchema = z.infer<typeof menuFormSchema>;

export interface MenuFormValues {
  name: string;
  description: string;
  price: number; // satang
  imageUrl: string;
  categoryId: string;
  estimatedCookingMinutes: number;
}

interface MenuFormProps {
  initial?: MenuItem;
  onSubmit: (values: MenuFormValues) => Promise<void>;
  submitLabel: string;
}

export function MenuForm({ initial, onSubmit, submitLabel }: MenuFormProps) {
  const categoriesQuery = useAdminMenuCategories();
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MenuFormSchema>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      priceBaht: initial ? String(satangToBaht(initial.price)) : '',
      imageUrl: initial?.imageUrl ?? '',
      categoryId: initial?.categoryId ?? '',
      minutes: String(initial?.estimatedCookingMinutes ?? 10),
    },
  });

  const categoryId = useWatch({ control, name: 'categoryId' });

  useEffect(() => {
    if (!initial && !categoryId && categories.length > 0) {
      setValue('categoryId', categories[0].id);
    }
  }, [initial, categoryId, categories, setValue]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      description: values.description,
      price: bahtToSatang(Number(values.priceBaht)),
      imageUrl: values.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(values.name)}/400/300`,
      categoryId: values.categoryId,
      estimatedCookingMinutes: Number(values.minutes),
    });
  });

  return (
    <form className="flex max-w-lg flex-col gap-4" onSubmit={submit}>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">ชื่อเมนู</label>
        <Input aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">คำอธิบาย</label>
        <Textarea aria-invalid={!!errors.description} {...register('description')} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">ราคา (บาท)</label>
          <Input type="number" min={0} aria-invalid={!!errors.priceBaht} {...register('priceBaht')} />
          {errors.priceBaht && <p className="text-xs text-destructive">{errors.priceBaht.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">เวลาปรุง (นาที)</label>
          <Input type="number" min={1} aria-invalid={!!errors.minutes} {...register('minutes')} />
          {errors.minutes && <p className="text-xs text-destructive">{errors.minutes.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">หมวดหมู่</label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={categoriesQuery.isPending}>
              <SelectTrigger className="w-full" aria-invalid={!!errors.categoryId}>
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
        {categoriesQuery.error && (
          <p className="text-xs text-destructive">โหลดหมวดหมู่ไม่สำเร็จ: {categoriesQuery.error.message}</p>
        )}
        {!categoriesQuery.isPending && !categoriesQuery.error && categories.length === 0 && (
          <p className="text-xs text-muted-foreground">
            ยังไม่มีหมวดหมู่ —{' '}
            <Link href={`${ADMIN_MENU_PATH}/categories`} className="font-medium text-primary underline">
              ไปเพิ่มหมวดหมู่ก่อน
            </Link>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">ลิงก์รูปภาพ (เว้นว่างเพื่อใช้รูปสุ่ม)</label>
        <Input aria-invalid={!!errors.imageUrl} {...register('imageUrl')} />
        {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'กำลังบันทึก...' : submitLabel}
      </Button>
    </form>
  );
}
