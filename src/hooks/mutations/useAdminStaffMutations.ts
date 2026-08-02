import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/api/live/http/normalizeError';
import type { ID } from '@/lib/types/common';
import type { Role, StaffUser } from '@/lib/types';
import type { CreateStaffUserInput } from '@/lib/api/contract';
import { adminRolesQueryKey, adminStaffUsersQueryKey } from '@/hooks/queries/useAdminStaff';

function useInvalidateStaffUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminStaffUsersQueryKey });
}

function useInvalidateRoles() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminRolesQueryKey });
}

export function useCreateStaffUser() {
  const invalidate = useInvalidateStaffUsers();
  return useMutation<StaffUser, AppError, CreateStaffUserInput>({
    mutationFn: (input) => api.createStaffUser(input),
    onSuccess: invalidate,
  });
}

export function useUpdateStaffUser() {
  const invalidate = useInvalidateStaffUsers();
  return useMutation<StaffUser, AppError, { id: ID; input: Partial<Omit<StaffUser, 'id'>> }>({
    mutationFn: ({ id, input }) => api.updateStaffUser(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteStaffUser() {
  const invalidate = useInvalidateStaffUsers();
  return useMutation<StaffUser, AppError, ID>({
    mutationFn: (id) => api.deleteStaffUser(id),
    onSuccess: invalidate,
  });
}

export function useUpdateRole() {
  const invalidate = useInvalidateRoles();
  return useMutation<Role, AppError, { id: ID; name: string }>({
    mutationFn: ({ id, name }) => api.updateRole(id, name),
    onSuccess: invalidate,
  });
}
