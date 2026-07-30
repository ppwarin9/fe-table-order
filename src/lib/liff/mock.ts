import { uuid } from '@/lib/mock/helpers'; // อิงตาม path ของคุณเลยครับ
import type { LineProfile } from '@/lib/types'; // ปรับ path ให้ตรงโปรเจกต์คุณ

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

// Helper สำหรับสุ่มหยิบของใน Array 1 ชิ้น
const sample = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const randomProfile = (): LineProfile => {
  const userId = `U${uuid().replace(/-/g, '').slice(0, 24)}`;
  return {
    userId,
    // แก้บั๊กตรงนี้: ให้มันสุ่มหยิบมาแค่ชื่อเดียวแทนที่จะโชว์ทั้ง Array
    displayName: `${sample(FIRST_NAMES)} ${sample(LAST_INITIALS)}`,
    pictureUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${userId}`,
    isOaFriend: Math.random() < 0.7,
  };
};

// ฟังก์ชันหน่วงเวลาจำลองการโหลด
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function init(): Promise<void> {
  console.log('[Mock LIFF] Initializing...');
  await delay(300); // แอบหน่วงเวลาให้เหมือนโหลดจริงนิดนึง
}

export async function getProfile(): Promise<LineProfile> {
  await init();

  // ป้องกัน Next.js ฝั่ง Server
  if (typeof window === 'undefined') return randomProfile();

  // เช็กว่ามี Cache ใน Session ไหม
  const cached = window.sessionStorage.getItem(STORAGE_KEY);
  if (cached) return JSON.parse(cached) as LineProfile;

  // ถ้าไม่มีให้สุ่มใหม่ แล้วเก็บลง Session
  const profile = randomProfile();
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export async function getFriendship(): Promise<boolean> {
  await init();
  // ดึงค่าอิงจาก profile ที่ถูก cache ไว้ จะได้สมจริง
  const profile = await getProfile();
  return profile.isOaFriend;
}

export async function getAccessToken(): Promise<string | null> {
  await init();
  return 'mock_access_token_12345';
}
