import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';
import type { Role, StaffUser } from '@/lib/types';
import type { CreateStaffUserInput } from '@/lib/api/contract';
import { adminRolesQueryKey, adminStaffUsersQueryKey } from '@/hooks/queries/useAdminStaff';
import { useInvalidate } from '@/hooks/mutations/useInvalidate';

export function useCreateStaffUser() {
  const invalidate = useInvalidate(adminStaffUsersQueryKey);
  return useMutation<StaffUser, AppError, CreateStaffUserInput>({
    mutationFn: (input) => api.createStaffUser(input),
    onSuccess: invalidate,
  });
}

export function useUpdateStaffUser() {
  const invalidate = useInvalidate(adminStaffUsersQueryKey);
  return useMutation<StaffUser, AppError, { id: ID; input: Partial<Omit<StaffUser, 'id'>> }>({
    mutationFn: ({ id, input }) => api.updateStaffUser(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteStaffUser() {
  const invalidate = useInvalidate(adminStaffUsersQueryKey);
  return useMutation<StaffUser, AppError, ID>({
    mutationFn: (id) => api.deleteStaffUser(id),
    onSuccess: invalidate,
  });
}

export function useChangeOwnPassword() {
  return useMutation<StaffUser, AppError, { currentPassword: string; newPassword: string }>({
    mutationFn: (input) => api.changeOwnPassword(input),
  });
}

export function useResetStaffPassword() {
  return useMutation<StaffUser, AppError, { id: ID; newPassword: string }>({
    mutationFn: ({ id, newPassword }) => api.resetStaffPassword(id, newPassword),
  });
}

export function useUpdateRole() {
  const invalidate = useInvalidate(adminRolesQueryKey);
  return useMutation<Role, AppError, { id: ID; name: string }>({
    mutationFn: ({ id, name }) => api.updateRole(id, name),
    onSuccess: invalidate,
  });
}
