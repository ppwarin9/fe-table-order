// Real menu catalog: customer browsing (Public) + admin CRUD (ADMIN-only).
import type { ID } from '@/lib/types/common';
import type { MenuCategory, MenuItem, MenuItemDetail } from '@/lib/types';
import { adminHttp } from './http/adminHttp';
import { liffHttp } from './http/liffHttp';

// ---- customer ----

export async function getCategories(): Promise<MenuCategory[]> {
  const { data } = await liffHttp.get<MenuCategory[]>('/liff/menu-categories');
  return data;
}

export async function getMenuItems(categoryId?: ID): Promise<MenuItem[]> {
  const { data } = await liffHttp.get<MenuItem[]>('/liff/menu-items', {
    params: categoryId ? { categoryId } : undefined,
  });
  return data;
}

export async function getMenuItem(menuItemId: ID): Promise<MenuItemDetail> {
  const { data } = await liffHttp.get<MenuItem>(`/liff/menu-items/${menuItemId}`);
  // Backend has no per-item modifier groups/options at all — always empty.
  return { ...data, modifierGroups: [] };
}

// ---- admin ----

export async function getCategoriesAdmin(): Promise<MenuCategory[]> {
  const { data } = await adminHttp.get<MenuCategory[]>('/admin/menu-categories');
  return data;
}

export async function createCategory(
  input: Omit<MenuCategory, 'id' | 'isActive' | 'storeId'>,
): Promise<MenuCategory> {
  const { data } = await adminHttp.post<MenuCategory>('/admin/menu-categories', input);
  return data;
}

export async function updateCategory(
  categoryId: ID,
  input: Partial<Omit<MenuCategory, 'id'>>,
): Promise<MenuCategory> {
  const { data } = await adminHttp.patch<MenuCategory>(
    `/admin/menu-categories/${categoryId}`,
    input,
  );
  return data;
}

export async function deleteCategory(categoryId: ID): Promise<void> {
  await adminHttp.delete(`/admin/menu-categories/${categoryId}`);
}

export async function getMenuItemsAdmin(): Promise<MenuItem[]> {
  const { data } = await adminHttp.get<MenuItem[]>('/admin/menu-items');
  return data;
}

// Distinct from the customer-facing getMenuItem: reads via the ADMIN-only endpoint, so
// it can still find an item whose category has since been deactivated.
export async function getMenuItemAdmin(menuItemId: ID): Promise<MenuItem> {
  const { data } = await adminHttp.get<MenuItem>(`/admin/menu-items/${menuItemId}`);
  return data;
}

export async function createMenuItem(
  input: Omit<MenuItem, 'id' | 'isAvailable' | 'storeId'>,
): Promise<MenuItem> {
  const { data } = await adminHttp.post<MenuItem>('/admin/menu-items', input);
  return data;
}

export async function updateMenuItem(
  menuItemId: ID,
  input: Partial<Omit<MenuItem, 'id'>>,
): Promise<MenuItem> {
  const { data } = await adminHttp.patch<MenuItem>(`/admin/menu-items/${menuItemId}`, input);
  return data;
}

export async function deleteMenuItem(menuItemId: ID): Promise<void> {
  await adminHttp.delete(`/admin/menu-items/${menuItemId}`);
}

// Standalone from create/update — works before a menu item id exists yet (the create
// form's case). Axios sets the multipart boundary header itself from the FormData
// instance; don't set Content-Type manually here.
export async function uploadMenuItemImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await adminHttp.post<{ imageUrl: string }>(
    '/admin/menu-items/upload-image',
    formData,
  );
  return data.imageUrl;
}
