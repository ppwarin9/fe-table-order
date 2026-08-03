'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMenuCategories } from '@/hooks/queries/useMenuCategories';
import { useMenuItems } from '@/hooks/queries/useMenuItems';
import { useSession } from '@/hooks/useSession';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemberAvatarStack } from '@/components/customer/MemberAvatarStack';
import { formatTHB } from '@/lib/billing/money';

export default function MenuPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const categoriesQuery = useMenuCategories();
  const itemsQuery = useMenuItems(categoryId);
  const { tableNumber, members } = useSession();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">เมนู</h1>
          {tableNumber && <p className="text-sm text-muted-foreground">โต๊ะ {tableNumber}</p>}
        </div>
        <MemberAvatarStack members={members} />
      </div>

      {categoriesQuery.isPending ? (
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      ) : (
        <Tabs value={categoryId ?? 'all'} onValueChange={(v) => setCategoryId(v === 'all' ? undefined : v)}>
          <TabsList className="h-auto flex-wrap justify-start bg-transparent p-0">
            <TabsTrigger value="all" className="rounded-full border data-active:bg-primary data-active:text-primary-foreground">
              ทั้งหมด
            </TabsTrigger>
            {categoriesQuery.data?.filter((c) => c.isActive).map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="rounded-full border data-active:bg-primary data-active:text-primary-foreground"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {itemsQuery.isPending ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : itemsQuery.error ? (
        <p className="text-sm text-destructive">{itemsQuery.error.message}</p>
      ) : itemsQuery.data?.length === 0 ? (
        <p className="text-sm text-muted-foreground">ยังไม่มีเมนูในหมวดนี้</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {itemsQuery.data?.map((item) => (
            <Link
              key={item.id}
              href={`/menu/${item.id}`}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-square w-full bg-muted">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-2xl">🍽️</div>
                )}
                {!item.isAvailable && (
                  <Badge variant="secondary" className="absolute left-2 top-2 bg-background/90">
                    หมด
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-0.5 p-2.5">
                <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                <p className="text-sm font-semibold text-primary">{formatTHB(item.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
