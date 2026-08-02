import type { ID } from '@/lib/types/common';

export interface DiningTable {
  id: ID;
  storeId: ID;
  tableNumber: string;
  qrToken: string;
  qrGeneratedAt: string;
  isActive: boolean;
}

export type SessionStatus = 'open' | 'closed';

export interface TableSession {
  id: ID;
  diningTableId: ID;
  status: SessionStatus;
  openedAt: string;
  closedAt: string | null;
}

export interface SessionMember {
  id: ID;
  tableSessionId: ID;
  customerId: ID;
  sessionToken: string;
  joinedAt: string;
}
