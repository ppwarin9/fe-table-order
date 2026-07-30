import { env } from '@/config/env';
import { LineProfile } from '@/lib/types';
import liffSdk from '@line/liff';

let readyPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (!readyPromise) {
    readyPromise = (async () => {
      try {
        await liffSdk.init({ liffId: env.NEXT_PUBLIC_LIFF_ID });

        if (!liffSdk.isLoggedIn()) {
          liffSdk.login();
        }
      } catch (err) {
        console.error('LIFF Init Error:', err);
        readyPromise = null;
        throw err;
      }
    })();
  }
  return readyPromise;
}

export async function init(): Promise<void> {
  await ensureInit();
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
