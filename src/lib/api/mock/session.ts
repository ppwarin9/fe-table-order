import { type JoinTableResult } from '@/lib/api/contract';
import { liff } from '@/lib/liff';
import { db, save } from '@/lib/mock/db';
import { delay, uuid } from '@/lib/mock/helpers';

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

  const profile = await liff.getProfile();
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
