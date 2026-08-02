// Real QR-join flow (POST /liff/table-sessions/join, idToken-verified) plus session/
// member reads.
import { liffService } from '@/lib/liff';
import type { ID } from '@/lib/types/common';
import type { JoinTableResult, SessionInfo, SessionMemberView } from '../contract';
import { liffHttp } from './http/liffHttp';

interface JoinResponse {
  sessionToken: string;
  sessionMemberId: string;
  tableNumber: string;
  tableSession: {
    id: string;
    diningTableId: string;
    status: 'OPEN' | 'CLOSED';
    openedAt: string;
    closedAt: string | null;
  };
}

export async function joinTable(qrToken: string): Promise<JoinTableResult> {
  const [profile, idToken] = await Promise.all([
    liffService.getProfile(),
    liffService.getIDToken(),
  ]);
  if (!idToken) {
    throw new Error('ไม่พบ ID Token จาก LINE กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
  }

  const { data } = await liffHttp.post<JoinResponse>('/liff/table-sessions/join', {
    qrToken,
    idToken,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl,
  });

  return {
    tableSessionId: data.tableSession.id,
    memberId: data.sessionMemberId,
    sessionToken: data.sessionToken,
    tableNumber: data.tableNumber,
    member: {
      id: data.sessionMemberId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
    },
  };
}

interface BackendTableSession {
  id: string;
  diningTableId: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt: string | null;
}

/** GET /liff/table-sessions/current — session-token-scoped, so no sessionId param
 *  actually reaches the backend; kept for ApiClient signature parity. */
export async function getSession(sessionId: ID): Promise<SessionInfo> {
  void sessionId;
  const { data } = await liffHttp.get<BackendTableSession>('/liff/table-sessions/current');
  return {
    id: data.id,
    status: data.status === 'OPEN' ? 'open' : 'closed',
    tableNumber: '',
    openedAt: data.openedAt,
  };
}

interface BackendSessionMember {
  id: string;
  displayName: string;
  pictureUrl: string;
  joinedAt: string;
}

/** GET /liff/table-sessions/members — scoped by the session token itself. */
export async function getMembers(sessionId: ID): Promise<SessionMemberView[]> {
  void sessionId;
  const { data } = await liffHttp.get<BackendSessionMember[]>('/liff/table-sessions/members');
  return data;
}
