// Landing (dev): จำลองการสแกน QR ประจำโต๊ะ + ลิงก์เข้าหลังบ้าน
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { DiningTable } from '@/lib/types';

export default function Home() {
  const [tables, setTables] = useState<DiningTable[]>([]);

  useEffect(() => {
    api.getTables().then(setTables);
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 bg-customer-bg p-6">
      <header className="pt-8 text-center">
        <h1 className="text-2xl font-bold text-customer-text-primary">
          🍽️ TableLink
        </h1>
        <p className="mt-1 text-sm text-customer-text-secondary">
          หน้านี้ใช้จำลองการ "สแกน QR ประจำโต๊ะ" ระหว่างพัฒนา
        </p>
      </header>

      <section>
        <div className="grid grid-cols-4 gap-2">
          {tables.map((table) => (
            <Link
              key={table.id}
              href={`/join?t=${table.qrToken}`}
              className="flex aspect-square flex-col items-center justify-center rounded-xl border border-customer-border bg-white active:bg-customer-tint"
            >
              <span className="text-xl">🪑</span>
              <span className="text-sm font-semibold text-customer-text-primary">
                {table.tableNumber}
              </span>
            </Link>
          ))}
        </div>
      </section>
      {/* ลิงก์ 🔐 เข้าระบบหลังบ้าน — เพิ่มท้ายไฟล์ได้เลย มีผลตอน Slice 9 */}
    </div>
  );
}
