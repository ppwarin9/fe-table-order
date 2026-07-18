import type { StaffUser } from '@/lib/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AdminState {
  token: string | null;
  staff: StaffUser | null;
  setAuth: (auth: { token: string; staff: StaffUser }) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      token: null,
      staff: null,
      setAuth: ({ token, staff }) => set({ token, staff }),
      logout: () => set({ token: null, staff: null }),
    }),
    {
      name: 'table-admin',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
