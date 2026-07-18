import type { Satang } from '@/lib/types/common';

export const bahtToSatang = (baht: number): Satang => Math.round(baht * 100);

export const satangToBaht = (satang: Satang): number => satang / 100;

export const formatTHB = (satang: Satang): string =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    currencyDisplay: 'symbol',
  }).format(satangToBaht(satang));

export const splitEvenly = (total: Satang, parts: number): Satang[] => {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  return Array.from(
    { length: parts },
    (_, i) => base + (i < remainder ? 1 : 0),
  );
};
