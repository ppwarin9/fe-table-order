let adminAccessToken: string | null = null;
let onAdminUnauthorized: (() => void) | null = null;

export function setAdminAccessToken(token: string | null) {
  adminAccessToken = token;
}

export function getAdminAccessToken(): string | null {
  return adminAccessToken;
}
export function setAdminUnauthorizedHandler(handler: (() => void) | null) {
  onAdminUnauthorized = handler;
}

export function getAdminUnauthorizedHandler(): (() => void) | null {
  return onAdminUnauthorized;
}
