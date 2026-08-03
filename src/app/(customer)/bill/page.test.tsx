import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import BillPage from './page';
import { useBill } from '@/hooks/useBill';
import { useSessionStore } from '@/stores/sessionStore';

vi.mock('@/hooks/useBill');
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('BillPage split-method picker', () => {
  const issueBill = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({
      sessionId: 'session-1',
      memberId: 'member-1',
      sessionToken: 'token-1',
      tableNumber: 'T1',
    });
    vi.mocked(useBill).mockReturnValue({
      bill: null,
      loading: false,
      error: null,
      issueBill,
      payShare: vi.fn(),
      refetch: vi.fn(),
    } as never);
  });

  it('defaults to the equal-split option', () => {
    render(<BillPage />);

    const equalRadio = screen.getByRole('radio', { name: /หารเท่ากันทุกคนในโต๊ะ/ });
    expect(equalRadio).toHaveAttribute('data-state', 'checked');
  });

  it('switches to single-payer when clicked, and issues the bill with the selected method', async () => {
    const user = userEvent.setup();
    render(<BillPage />);

    const singlePayerRadio = screen.getByRole('radio', {
      name: /คนเดียวจ่ายทั้งหมด/,
    });
    await user.click(singlePayerRadio);
    expect(singlePayerRadio).toHaveAttribute('data-state', 'checked');

    await user.click(screen.getByRole('button', { name: 'ออกบิล' }));

    await waitFor(() =>
      expect(issueBill).toHaveBeenCalledWith('single_payer', 'member-1'),
    );
  });

  it('issues an equal-split bill without a payerId when left on the default', async () => {
    const user = userEvent.setup();
    render(<BillPage />);

    await user.click(screen.getByRole('button', { name: 'ออกบิล' }));

    await waitFor(() => expect(issueBill).toHaveBeenCalledWith('equal', undefined));
  });
});
