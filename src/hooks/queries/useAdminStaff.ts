import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { Role, StaffUser } from '@/lib/types';

export const adminStaffUsersQueryKey = ['admin', 'staff-users'] as const;
export const adminRolesQueryKey = ['admin', 'roles'] as const;

export function useAdminStaffUsers() {
  return useQuery<StaffUser[], AppError>({
    queryKey: adminStaffUsersQueryKey,
    queryFn: () => api.getStaffUsers(),
  });
}

export function useAdminRoles() {
  return useQuery<Role[], AppError>({
    queryKey: adminRolesQueryKey,
    queryFn: () => api.getRoles(),
  });
}
