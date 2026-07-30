import type { DiningTable, MenuCategory, MenuItem, Store } from '@/lib/types';

export interface SeedData {
  store: Store;
  diningTables: DiningTable[];
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
}

export function seedDb(): SeedData {
  const now = new Date().toISOString();
  const storeId = 'store-1';

  const store: Store = {
    id: storeId,
    name: 'ร้านลาบเป็ดป้าแดง',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const diningTables: DiningTable[] = Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return {
      id: `table-${n}`,
      storeId,
      tableNumber: String(n),
      qrToken: `qr-token-table-${n}`,
      qrGeneratedAt: now,
      isActive: true,
    };
  });

  const menuCategories: MenuCategory[] = [
    {
      id: 'cat-1',
      storeId,
      name: 'อาหารจานหลัก',
      sortOrder: 1,
      isActive: true,
    },
    { id: 'cat-2', storeId, name: 'ของทานเล่น', sortOrder: 2, isActive: true },
    { id: 'cat-3', storeId, name: 'เครื่องดื่ม', sortOrder: 3, isActive: true },
    { id: 'cat-4', storeId, name: 'ของหวาน', sortOrder: 4, isActive: true },
  ];

  const menuItems: MenuItem[] = [
    {
      id: 'menu-1',
      storeId,
      categoryId: 'cat-1',
      name: 'ลาบเป็ด',
      description: 'ลาบเป็ดรสจัดจ้าน เครื่องแน่น',
      price: 12000,
      imageUrl: 'https://picsum.photos/seed/menu-1/400/300',
      estimatedCookingMinutes: 15,
      isAvailable: true,
    },
    {
      id: 'menu-2',
      storeId,
      categoryId: 'cat-1',
      name: 'ต้มแซ่บกระดูกอ่อน',
      description: 'ต้มแซ่บรสเปรี้ยวเผ็ดกำลังดี',
      price: 15000,
      imageUrl: 'https://picsum.photos/seed/menu-2/400/300',
      estimatedCookingMinutes: 20,
      isAvailable: true,
    },
    {
      id: 'menu-3',
      storeId,
      categoryId: 'cat-1',
      name: 'ข้าวผัดกระเพราหมูสับ',
      description: 'ผัดกระเพราสูตรดั้งเดิม เผ็ดกำลังดี',
      price: 6000,
      imageUrl: 'https://picsum.photos/seed/menu-3/400/300',
      estimatedCookingMinutes: 10,
      isAvailable: true,
    },
    {
      id: 'menu-4',
      storeId,
      categoryId: 'cat-2',
      name: 'ไก่ทอดหาดใหญ่',
      description: 'ไก่ทอดกรอบนอกนุ่มใน เสิร์ฟพร้อมน้ำจิ้ม',
      price: 9000,
      imageUrl: 'https://picsum.photos/seed/menu-4/400/300',
      estimatedCookingMinutes: 12,
      isAvailable: true,
    },
    {
      id: 'menu-5',
      storeId,
      categoryId: 'cat-2',
      name: 'ปีกไก่ทอดน้ำปลา',
      description: 'ปีกไก่หมักน้ำปลาทอดกรอบ',
      price: 8000,
      imageUrl: 'https://picsum.photos/seed/menu-5/400/300',
      estimatedCookingMinutes: 12,
      isAvailable: true,
    },
    {
      id: 'menu-6',
      storeId,
      categoryId: 'cat-3',
      name: 'ชาไทยเย็น',
      description: 'ชาไทยหอมมันสูตรต้นตำรับ',
      price: 4500,
      imageUrl: 'https://picsum.photos/seed/menu-6/400/300',
      estimatedCookingMinutes: 3,
      isAvailable: true,
    },
    {
      id: 'menu-7',
      storeId,
      categoryId: 'cat-3',
      name: 'น้ำมะนาวโซดา',
      description: 'สดชื่นดับกระหาย',
      price: 4000,
      imageUrl: 'https://picsum.photos/seed/menu-7/400/300',
      estimatedCookingMinutes: 3,
      isAvailable: true,
    },
    {
      id: 'menu-8',
      storeId,
      categoryId: 'cat-4',
      name: 'ข้าวเหนียวมะม่วง',
      description: 'มะม่วงสุกหวานฉ่ำกับข้าวเหนียวมูล',
      price: 8000,
      imageUrl: 'https://picsum.photos/seed/menu-8/400/300',
      estimatedCookingMinutes: 5,
      isAvailable: true,
    },
  ];

  return { store, diningTables, menuCategories, menuItems };
}
