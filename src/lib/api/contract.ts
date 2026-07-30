import type { DiningTable, MenuCategory, MenuItem } from '@/lib/types';
import type { ID } from '@/lib/types/common';

export interface SessionInfo {
  id: ID;
  status: 'open' | 'closed';
  tableNumber: string;
  openedAt: string;
}

export interface SessionMemberView {
  id: ID;
  displayName: string;
  pictureUrl: string;
  joinedAt: string;
}

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
  getSession(sessionId: ID): Promise<SessionInfo>;
  getMembers(sessionId: ID): Promise<SessionMemberView[]>;
  getCategories(): Promise<MenuCategory[]>;
  getMenuItems(categoryId?: ID): Promise<MenuItem[]>;
}
