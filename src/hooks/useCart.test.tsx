import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { useCart } from '@/hooks/useCart';
import { useSessionStore } from '@/stores/sessionStore';
import { api } from '@/lib/api';

const mockCartDetail = {
  cart: { id: 'cart-1', tableSessionId: 'session-1', updatedAt: '2026-01-01T00:00:00.000Z' },
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

vi.mock('@/lib/api', () => ({
  api: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateQty: vi.fn(),
    removeItem: vi.fn(),
  },
}));

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useCart(), { wrapper });
}

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({
      sessionId: 'session-1',
      memberId: 'member-1',
      sessionToken: 'token-1',
      tableNumber: 'T1',
    });
    vi.mocked(api.getCart).mockResolvedValue(mockCartDetail);
  });

  it('loads the current cart for the active session', async () => {
    const { result } = renderWithQueryClient();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(api.getCart).toHaveBeenCalledWith('session-1');
    expect(result.current.cart).toEqual(mockCartDetail);
  });

  it('addItem calls api.addItem with the session and member id from the store', async () => {
    vi.mocked(api.addItem).mockResolvedValue(mockCartDetail);
    const { result } = renderWithQueryClient();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addItem({ menuItemId: 'menu-item-1', quantity: 2 });
    });

    expect(api.addItem).toHaveBeenCalledWith('session-1', 'member-1', {
      menuItemId: 'menu-item-1',
      quantity: 2,
    });
  });

  it('removeItem calls api.removeItem with the session id and cart item id', async () => {
    vi.mocked(api.removeItem).mockResolvedValue(mockCartDetail);
    const { result } = renderWithQueryClient();
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeItem('cart-item-1');
    });

    expect(api.removeItem).toHaveBeenCalledWith('session-1', 'cart-item-1');
  });
});
