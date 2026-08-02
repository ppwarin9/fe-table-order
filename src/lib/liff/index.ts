// Always the real LIFF SDK — a real LIFF ID is required (see .env.local.example);
// there is no mock fallback, so the join flow only works against a real LINE client
// or LIFF's own browser-based dev mode.
export * as liffService from './real';
