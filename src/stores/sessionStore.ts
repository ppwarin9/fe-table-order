import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SessionState {
  sessionId: string | null;
  memberId: string | null;
  sessionToken: string | null;
  tableNumber: string | null;
  setSession: (s: {
    sessionId: string;
    memberId: string;
    sessionToken: string;
    tableNumber: string;
  }) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      memberId: null,
      sessionToken: null,
      tableNumber: null,
      setSession: (s) => set(s),
      clear: () =>
        set({
          sessionId: null,
          memberId: null,
          sessionToken: null,
          tableNumber: null,
        }),
    }),
    {
      name: 'table-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
