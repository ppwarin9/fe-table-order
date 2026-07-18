import type { DiningTable } from '@/lib/types';
import { ID } from '@/lib/types/common';

export interface JoinTableResult {
  tableSessionId: ID;
  memberId: ID;
  sessionToken: string;
  tableNumber: string;
  member: { id: ID; displayName: string; pictureUrl: string };
}

export interface ApiClient {
  joinTable(qrToken: string): Promise<JoinTableResult>;
  getTables(): Promise<DiningTable[]>;
}
