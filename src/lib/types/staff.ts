import type { ID } from '@/lib/types/common';

// Fixed 3-tier hierarchy on the backend (SUPERADMIN > ADMIN > STAFF) — admin/roles only
// supports reading the list and renaming a role's display `name`, the set is closed.
export type RoleCode = 'SUPERADMIN' | 'ADMIN' | 'STAFF';

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
