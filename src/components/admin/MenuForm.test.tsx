import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MenuForm } from '@/components/admin/MenuForm';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getCategoriesAdmin: vi.fn(),
    uploadMenuItemImage: vi.fn(),
  },
}));

const categories = [{ id: 'cat-1', name: 'ของทานเล่น', sortOrder: 0, isActive: true }];

function renderMenuForm(onSubmit = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const utils = render(
    <MenuForm onSubmit={onSubmit} submitLabel="เพิ่มเมนู" />,
    { wrapper },
  );
  return { onSubmit, ...utils };
}

describe('MenuForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getCategoriesAdmin).mockResolvedValue(categories as never);
  });

  it('shows a validation error and does not submit when the name is empty', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderMenuForm();

    await waitFor(() => expect(api.getCategoriesAdmin).toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนู' }));

    expect(await screen.findByText('กรุณากรอกชื่อเมนู')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('converts the price from baht to satang and submits the transformed values', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderMenuForm();

    await waitFor(() => expect(api.getCategoriesAdmin).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/ชื่อเมนู/), 'ผัดไทย');
    await user.type(screen.getByLabelText('คำอธิบาย'), 'อร่อยมาก');
    await user.type(screen.getByLabelText(/ราคา/), '120');
    await user.click(screen.getByRole('button', { name: 'เพิ่มเมนู' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.name).toBe('ผัดไทย');
    expect(submitted.price).toBe(12000); // 120 baht -> 12000 satang
    expect(submitted.categoryId).toBe('cat-1');
  });

  it('uploads a selected image and fills in the imageUrl field on success', async () => {
    vi.mocked(api.uploadMenuItemImage).mockResolvedValue(
      'https://res.cloudinary.com/demo/image/upload/v1/menu-items/abc123.jpg',
    );
    renderMenuForm();
    await waitFor(() => expect(api.getCategoriesAdmin).toHaveBeenCalled());

    const file = new File(['fake-image-bytes'], 'photo.jpg', { type: 'image/jpeg' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const user = userEvent.setup();

    await user.upload(fileInput, file);

    await waitFor(() => expect(api.uploadMenuItemImage).toHaveBeenCalledWith(file));
  });
});
