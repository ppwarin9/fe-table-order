import type { ID } from '@/lib/types/common';

export interface Customer {
  id: ID;
  lineUserId: string;
  displayName: string;
  pictureUrl: string;
  isOaFriend: boolean;
  firstSeenAt: string;
  updatedAt: string;
}

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl: string;
  isOaFriend: boolean;
}
