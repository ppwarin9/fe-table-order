import type {
  SessionMemberView,
  JoinTableResult,
  SessionInfo,
} from '@/lib/api/contract';
import { liffService } from '@/lib/liff';
import { db, save } from '@/lib/mock/db';
import { delay, uuid } from '@/lib/mock/helpers';
import type { ID } from '@/lib/types/common';

export async function joinTable(qrToken: string): Promise<JoinTableResult> {
  await delay();

  const table = db.diningTables.find(
    (t) => t.qrToken === qrToken && t.isActive,
  );
  if (!table) throw new Error('Table notfound or expired qr');

  const now = new Date().toISOString();
  let session = db.tableSessions.find(
    (s) => s.dinningTableId === table.id && s.status === 'open',
  );
  if (!session) {
    session = {
      id: uuid(),
      dinningTableId: table.id,
      status: 'open',
      openedAt: now,
      closedAt: null,
    };
    db.tableSessions.push(session);
  }

  const profile = await liffService.getProfile();
  let customer = db.customers.find((c) => c.lineUserId === profile.userId);
  if (!customer) {
    customer = {
      id: uuid(),
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      isOaFriend: profile.isOaFriend,
      firstSeenAt: now,
      updatedAt: now,
    };
    db.customers.push(customer);
  }

  const sessionId = session.id;
  let member = db.sessionMembers.find(
    (m) => m.tableSessionId === sessionId && m.customerId === customer!.id,
  );
  if (!member) {
    member = {
      id: uuid(),
      tableSessionId: sessionId,
      customerId: customer.id,
      sessionToken: uuid(),
      joinedAt: now,
    };

    db.sessionMembers.push(member);
  }
  save();

  return {
    tableSessionId: sessionId,
    memberId: member.id,
    sessionToken: member.sessionToken,
    tableNumber: table.tableNumber,
    member: {
      id: customer.id,
      displayName: customer.displayName,
      pictureUrl: customer.pictureUrl,
    },
  };
}

export async function getSession(sessionId: ID): Promise<SessionInfo> {
  await delay();
  const session = db.tableSessions.find((s) => s.id === sessionId);
  if (!session) throw new Error('invalid session');

  const table = db.diningTables.find((t) => t.id === session?.dinningTableId);
  return {
    id: session.id,
    status: session.status,
    tableNumber: table?.tableNumber ?? '',
    openedAt: session.openedAt,
  };
}

export async function getMembers(sessionId: ID): Promise<SessionMemberView[]> {
  await delay();
  return db.sessionMembers
    .filter((m) => m.tableSessionId === sessionId)
    .map((m) => {
      const customer = db.customers.find((c) => c.id === m.customerId);
      return {
        id: m.id,
        displayName: customer?.displayName ?? 'ลูกค้า',
        pictureUrl: customer?.pictureUrl ?? '',
        joinedAt: m.joinedAt,
      };
    });
}
