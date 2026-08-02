// Real admin staff/role surface — SUPERADMIN only per backend's RolesGuard hierarchy.
// Response fields match StaffUser/Role exactly (flat, same casing) — no mapping needed.
import type { ID } from '@/lib/types/common';
import type { Role, StaffUser } from '@/lib/types';
import type { CreateStaffUserInput } from '../contract';
import { adminHttp } from './http/adminHttp';

export async function getStaffUsers(): Promise<StaffUser[]> {
  const { data } = await adminHttp.get<StaffUser[]>('/admin/staff-user');
  return data;
}

export async function getStaffUser(staffId: ID): Promise<StaffUser> {
  const { data } = await adminHttp.get<StaffUser>(`/admin/staff-user/${staffId}`);
  return data;
}

export async function createStaffUser(input: CreateStaffUserInput): Promise<StaffUser> {
  const { data } = await adminHttp.post<StaffUser>('/admin/staff-user', input);
  return data;
}

export async function updateStaffUser(
  staffId: ID,
  input: Partial<Omit<StaffUser, 'id'>>,
): Promise<StaffUser> {
  const { data } = await adminHttp.patch<StaffUser>(`/admin/staff-user/${staffId}`, input);
  return data;
}

// Soft-delete — backend returns the now-inactive staff user, not void.
export async function deleteStaffUser(staffId: ID): Promise<StaffUser> {
  const { data } = await adminHttp.delete<StaffUser>(`/admin/staff-user/${staffId}`);
  return data;
}

export async function getRoles(): Promise<Role[]> {
  const { data } = await adminHttp.get<Role[]>('/admin/roles');
  return data;
}

// Only `name` (the display label) is editable — `code` is a fixed 3-value enum.
export async function updateRole(roleId: ID, name: string): Promise<Role> {
  const { data } = await adminHttp.patch<Role>(`/admin/roles/${roleId}`, { name });
  return data;
}
