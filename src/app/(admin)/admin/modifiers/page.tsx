// No modifier-group/option endpoints exist anywhere on the backend (customer or admin).
// Static placeholder — not part of the ApiClient contract at all, so there's nothing to
// wire up here yet. Wrapped in RequireRole for the same reason every other admin page
// is — this is unlinked from the sidebar but still directly reachable by URL.
import { RequireRole } from '@/components/admin/RequireRole';

export default function AdminModifiersPage() {
  return (
    <RequireRole role="ADMIN">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">ตัวเลือกเมนู</h1>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          <p className="text-2xl">🧩</p>
          <p className="text-sm">ยังไม่มี endpoint สำหรับจัดการตัวเลือกเมนู (modifiers) ทั้งฝั่งลูกค้าและแอดมิน</p>
        </div>
      </div>
    </RequireRole>
  );
}
