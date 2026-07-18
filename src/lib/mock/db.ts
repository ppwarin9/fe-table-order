import { type SeedData, seedDb } from '@/lib/mock/seed';
import type { Customer, SessionMember, TableSession } from '@/lib/types';

const STORAGE_KEY = 'tablelink-mockdb';

export interface MockDbShape extends SeedData {
  customers: Customer[];
  tableSessions: TableSession[];
  sessionMembers: SessionMember[];
}

function freshDb(): MockDbShape {
  return { ...seedDb(), customers: [], tableSessions: [], sessionMembers: [] };
}

function readStorage(): MockDbShape | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockDbShape) : null;
  } catch {
    return null;
  }
}

function writeStorage(state: MockDbShape): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const db: MockDbShape = readStorage() ?? freshDb();
if (
  typeof window !== 'undefined' &&
  !window.localStorage.getItem(STORAGE_KEY)
) {
  writeStorage(db);
}

export const save = (): void => writeStorage(db);

export const resetDb = (): void => {
  Object.assign(db, freshDb());
  save();
};
