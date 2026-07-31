import type { ID } from '@/lib/types/common';

export type RoleCode = 'owner' | 'manager' | 'staff';

export interface Role {
  id: ID;
  code: RoleCode;
  name: string;
}

export interface StaffUser {
  id: ID;
  roleId: ID;
  email: string;
  name: string;
  isActive: boolean;
}
