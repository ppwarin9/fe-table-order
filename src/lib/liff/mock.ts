import { uuid } from '@/lib/mock/helpers';
import type { LineProfile } from '@/lib/types';

const STORAGE_KEY = 'tablelink-liff-profile';
const FIRST_NAMES = [
  'ก้อง',
  'แนน',
  'ปอนด์',
  'มิ้นท์',
  'บอส',
  'ฟ้า',
  'ไอซ์',
  'เจน',
  'ปูน',
  'ต้นข้าว',
];
const LAST_INITIALS = ['ส.', 'พ.', 'ว.', 'ก.', 'ท.', 'ร.'];

const randomProfile = (): LineProfile => {
  const userId = `U${uuid().replace(/-/g, '').slice(0, 24)}`;
  return {
    userId,
    displayName: `${FIRST_NAMES} ${LAST_INITIALS}`,
    pictureUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${userId}`,
    isOaFriend: Math.random() < 0.7,
  };
};

export async function getProfile(): Promise<LineProfile> {
  if (typeof window === 'undefined') return randomProfile();
  const cached = window.sessionStorage.getItem(STORAGE_KEY);
  if (cached) return JSON.parse(cached) as LineProfile;
  const profile = randomProfile();
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}
