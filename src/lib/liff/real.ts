import { env } from '@/config/env';
import { LineProfile } from '@/lib/types';
import liffSdk from '@line/liff';

let readyPromise: Promise<void> | null = null;

// login() is deliberately never called automatically here. liff.init() itself can
// trigger an internal, in-client auto-login redirect independent of this module — but
// calling login() again ourselves after init() resolves/rejects is what previously
// caused an infinite redirect loop in production (the SDK's PKCE codeVerifier doesn't
// reliably survive the round trip through some tunnel/proxy setups). Login is instead
// only ever triggered by a user tapping a button — see triggerLogin below.
function ensureInit(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (!readyPromise) {
    readyPromise = liffSdk.init({ liffId: env.NEXT_PUBLIC_LIFF_ID }).catch((err) => {
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
}

export async function init(): Promise<void> {
  await ensureInit();
}

export function isLoggedIn(): boolean {
  return liffSdk.isLoggedIn();
}

export function triggerLogin(): void {
  liffSdk.login();
}

export async function getProfile(): Promise<LineProfile> {
  await ensureInit();
  const [profile, friendship] = await Promise.all([
    liffSdk.getProfile(),
    liffSdk.getFriendship(),
  ]);

  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl ?? '',
    isOaFriend: friendship.friendFlag,
  };
}

export async function getFriendship(): Promise<boolean> {
  await ensureInit();
  const { friendFlag } = await liffSdk.getFriendship();
  return friendFlag;
}

export async function getAccessToken(): Promise<string | null> {
  await ensureInit();
  return liffSdk.getAccessToken();
}

// Verified server-side by the backend against LINE (LineAuthService.verifyIdToken) to
// authenticate the join request — this is what proves the caller's identity now, not
// the raw LINE userId (which a request body could otherwise spoof). Requires the LIFF
// app's scope to include `openid`, otherwise this always resolves to null.
export async function getIDToken(): Promise<string | null> {
  await ensureInit();
  return liffSdk.getIDToken();
}
