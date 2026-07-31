import type { LoginInput, LoginResult } from '@/lib/api/contract';
import { adminHttp } from '@/lib/api/live/http/adminHttp';

interface BackendLoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roleId: string;
    isActive: boolean;
  };
}

interface BackendMeResponse {
  id: string;
  email: string;
  role: string;
}

export async function loginAndFetchProfile(
  email: string,
  password: string,
): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
}> {
  const { data: login } = await adminHttp.post<BackendLoginResponse>(
    '/auth/login',
    { email, password },
  );
  const { data: me } = await adminHttp.get<BackendMeResponse>('/auth/me', {
    headers: { Authorization: `Bearer ${login.accessToken}` },
  });

  return {
    id: me.id,
    email: me.email,
    name: login.user.name,
    role: me.role,
    accessToken: login.accessToken,
  };
}

export async function login({
  email,
  password,
}: LoginInput): Promise<LoginResult> {
  const profile = await loginAndFetchProfile(email, password);
  return {
    token: profile.accessToken,
    staff: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      roleId: profile.role,
      isActive: true,
    },
  };
}
