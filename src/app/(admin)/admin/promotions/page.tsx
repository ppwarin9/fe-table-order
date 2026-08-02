// No promotion endpoints exist anywhere on the backend (customer or admin). Static
// placeholder, same treatment as /admin/modifiers.
export default function AdminPromotionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">โปรโมชั่น</h1>
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        <p className="text-2xl">🏷️</p>
        <p className="text-sm">ยังไม่มี endpoint สำหรับจัดการโปรโมชั่นทั้งฝั่งลูกค้าและแอดมิน</p>
      </div>
    </div>
  );
}
