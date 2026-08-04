'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { useAdminMenuCategories } from '@/hooks/queries/useAdminMenu';
import { useUploadMenuItemImage } from '@/hooks/mutations/useMenuItemMutations';
import { bahtToSatang, satangToBaht } from '@/lib/billing/money';
import type { MenuItem } from '@/lib/types';
import { ADMIN_MENU_PATH } from '@/lib/routes';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/live/http/normalizeError';

const DESCRIPTION_MAX = 300;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Mirrors the backend's CreateMenuItemDto/UpdateMenuItemDto constraints exactly, so
// invalid input is caught here with an inline message instead of a raw 400 after submit.
const menuFormSchema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อเมนู').max(100, 'ชื่อเมนูยาวเกินไป (ไม่เกิน 100 ตัวอักษร)'),
  description: z.string().trim().min(1, 'กรุณากรอกคำอธิบาย').max(DESCRIPTION_MAX, 'คำอธิบายยาวเกินไป'),
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
  isAvailable: z.boolean(),
});

type MenuFormSchema = z.infer<typeof menuFormSchema>;

export interface MenuFormValues {
  name: string;
  description: string;
  price: number; // satang
  imageUrl: string;
  categoryId: string;
  estimatedCookingMinutes: number;
  isAvailable?: boolean;
}

interface MenuFormProps {
  initial?: MenuItem;
  onSubmit: (values: MenuFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}

export function MenuForm({ initial, onSubmit, onCancel, submitLabel }: MenuFormProps) {
  const categoriesQuery = useAdminMenuCategories();
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const uploadImage = useUploadMenuItemImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      isAvailable: initial?.isAvailable ?? true,
    },
  });

  const categoryId = useWatch({ control, name: 'categoryId' });
  const imageUrl = useWatch({ control, name: 'imageUrl' });
  const description = useWatch({ control, name: 'description' });

  useEffect(() => {
    if (!initial && !categoryId && categories.length > 0) {
      setValue('categoryId', categories[0].id);
    }
  }, [initial, categoryId, categories, setValue]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('รองรับเฉพาะไฟล์ JPEG, PNG, หรือ WebP');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('ไฟล์ใหญ่เกินไป (ไม่เกิน 5MB)');
      return;
    }

    try {
      const url = await uploadImage.mutateAsync(file);
      setValue('imageUrl', url, { shouldValidate: true });
      toast.success('อัปโหลดรูปแล้ว');
    } catch (err) {
      toast.error(getErrorMessage(err, 'อัปโหลดรูปไม่สำเร็จ'));
    }
  };

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      description: values.description,
      price: bahtToSatang(Number(values.priceBaht)),
      imageUrl: values.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(values.name)}/400/300`,
      categoryId: values.categoryId,
      estimatedCookingMinutes: Number(values.minutes),
      ...(initial && { isAvailable: values.isAvailable }),
    });
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadImage.isPending}
            className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="size-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <ImageIcon className="size-8 text-muted-foreground" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              {uploadImage.isPending ? (
                <Loader2 className="size-6 animate-spin text-white" />
              ) : (
                <Upload className="size-6 text-white" />
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="hidden"
            onChange={handleFileSelect}
          />
          <p className="text-center text-[11px] text-muted-foreground">
            แนะนำ 500x500px ไม่เกิน 5MB
            <br />
            คลิกที่รูปเพื่ออัปโหลด
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="menu-form-name" className="text-sm font-medium">
              ชื่อเมนู <span className="text-destructive">*</span>
            </label>
            <Input id="menu-form-name" aria-invalid={!!errors.name} {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="menu-form-price" className="text-sm font-medium">
                ราคา (บาท) <span className="text-destructive">*</span>
              </label>
              <Input
                id="menu-form-price"
                type="number"
                min={0}
                aria-invalid={!!errors.priceBaht}
                {...register('priceBaht')}
              />
              {errors.priceBaht && <p className="text-xs text-destructive">{errors.priceBaht.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">เวลาปรุง (นาที)</label>
              <Input type="number" min={1} aria-invalid={!!errors.minutes} {...register('minutes')} />
              {errors.minutes && <p className="text-xs text-destructive">{errors.minutes.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="menu-form-description" className="text-sm font-medium">
          คำอธิบาย
        </label>
        <Textarea
          id="menu-form-description"
          aria-invalid={!!errors.description}
          maxLength={DESCRIPTION_MAX}
          {...register('description')}
        />
        <div className="flex items-center justify-between">
          {errors.description ? (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <p className="text-[11px] text-muted-foreground">
            {(description ?? '').length}/{DESCRIPTION_MAX} ตัวอักษร
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">ลิงก์รูปภาพ (หรือจะวางลิงก์เองแทนการอัปโหลดก็ได้)</label>
        <Input aria-invalid={!!errors.imageUrl} {...register('imageUrl')} />
        {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
      </div>

      {initial && (
        <Controller
          control={control}
          name="isAvailable"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <span className="text-sm">พร้อมขาย</span>
            </div>
          )}
        />
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            ยกเลิก
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || uploadImage.isPending}>
          {isSubmitting ? 'กำลังบันทึก...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
