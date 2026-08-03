import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { api } from '@/lib/api';
import { useAdminOrderQueue } from '@/hooks/queries/useAdminOrderQueue';

vi.mock('next/navigation', () => ({ usePathname: () => '/admin' }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Test Admin', email: 'admin@example.com', role: 'ADMIN' } },
  }),
  signOut: vi.fn(),
}));
vi.mock('@/hooks/queries/useAdminOrderQueue', () => ({ useAdminOrderQueue: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: { getOrderQueue: vi.fn(), changeOwnPassword: vi.fn() },
}));

function renderSidebar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<Sidebar />, { wrapper });
}

describe('Sidebar change-password dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAdminOrderQueue).mockReturnValue({ data: [] } as never);
  });

  it('opens the change-password dialog and submits the current/new password', async () => {
    vi.mocked(api.changeOwnPassword).mockResolvedValue({} as never);
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'เปลี่ยนรหัสผ่าน' })).toBeInTheDocument();

    const [currentPasswordInput, newPasswordInput] = within(dialog).getAllByDisplayValue('');
    await user.type(currentPasswordInput, 'oldpassword1');
    await user.type(newPasswordInput, 'newpassword123');
    await user.click(within(dialog).getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));

    await waitFor(() =>
      expect(api.changeOwnPassword).toHaveBeenCalledWith({
        currentPassword: 'oldpassword1',
        newPassword: 'newpassword123',
      }),
    );
  });

  it('disables the submit button until the new password reaches 8 characters', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));
    const dialog = screen.getByRole('dialog');
    const [currentPasswordInput, newPasswordInput] = within(dialog).getAllByDisplayValue('');
    await user.type(currentPasswordInput, 'oldpassword1');
    await user.type(newPasswordInput, 'short');

    expect(within(dialog).getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' })).toBeDisabled();
  });
});
