import { test, expect } from '@playwright/test';

/**
 * Golden-path admin journey: log in with a real staff account -> land on the dashboard
 * -> open the order queue and confirm the 3-column board renders.
 *
 * Unlike the customer journey, admin login has no third-party auth in the loop (plain
 * email/password against NextAuth's Credentials provider), so this one genuinely
 * automates the whole thing end-to-end — it just needs a real backend and a real
 * account to log in with. Requires:
 *   NEXT_PUBLIC_API_BASE_URL   the backend this frontend build talks to
 *   E2E_ADMIN_EMAIL
 *   E2E_ADMIN_PASSWORD
 */
const { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } = process.env;

test.describe('admin login and order queue', () => {
  test.skip(
    !E2E_ADMIN_EMAIL || !E2E_ADMIN_PASSWORD,
    'Requires E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD for a real staff account — see ' +
      'comment at the top of this file.',
  );

  test('logs in and sees the order queue board', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel('อีเมล').fill(E2E_ADMIN_EMAIL!);
    await page.getByLabel('รหัสผ่าน').fill(E2E_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole('link', { name: 'ออเดอร์' }).click();
    await expect(page).toHaveURL(/\/admin\/orders/);
    await expect(page.getByRole('heading', { name: 'คิวออเดอร์' })).toBeVisible();

    // The 3-column board (Pending/Cooking/Served) — confirms the redesigned queue
    // actually renders its column headers rather than erroring out.
    await expect(page.getByText('รอคิว')).toBeVisible();
    await expect(page.getByText('กำลังทำ')).toBeVisible();

    await page.getByRole('tab', { name: 'ทั้งหมด' }).click();
    await expect(page.getByText('เสิร์ฟแล้ว').first()).toBeVisible();
  });
});
