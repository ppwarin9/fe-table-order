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
