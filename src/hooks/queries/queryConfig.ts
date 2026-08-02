// Menu data changes rarely relative to cart/order data, so queries that read it use a
// longer staleTime than the query client's default — shared here so they can't drift.
export const MENU_STALE_TIME_MS = 60_000;
