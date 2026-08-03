import { test, expect } from '@playwright/test';

/**
 * Golden-path customer journey: browse menu -> add an item to cart -> submit the order
 * -> see it in order history.
 *
 * The real join flow needs an actual LINE app (the backend verifies the LIFF idToken
 * against LINE's own servers — there is deliberately no way to fake this, see
 * LineAuthService.verifyIdToken), so this spec can't automate scanning a QR code. It
 * expects a table session to already exist (scan the QR once with a real phone) and
 * takes that session's token via env vars, injecting it into sessionStorage the same
 * way the real join flow does, then automates everything after that point.
 *
 * Requires, none of which exist in the environment this suite was authored in — a human
 * must run this against a real dev/staging backend, never production:
 *   NEXT_PUBLIC_API_BASE_URL   the backend this frontend build talks to
 *   E2E_TABLE_SESSION_ID       from a session created by actually scanning a table's QR
 *   E2E_MEMBER_ID
 *   E2E_SESSION_TOKEN
 *   E2E_TABLE_NUMBER
 */
const {
  E2E_TABLE_SESSION_ID,
  E2E_MEMBER_ID,
  E2E_SESSION_TOKEN,
  E2E_TABLE_NUMBER,
} = process.env;

test.describe('customer order journey', () => {
  test.skip(
    !E2E_TABLE_SESSION_ID || !E2E_MEMBER_ID || !E2E_SESSION_TOKEN,
    'Requires E2E_TABLE_SESSION_ID / E2E_MEMBER_ID / E2E_SESSION_TOKEN from a real, ' +
      'already-joined table session — see comment at the top of this file.',
  );

  test.beforeEach(async ({ page }) => {
    // Matches useSessionStore's zustand-persist shape exactly (name: 'table-session',
    // sessionStorage-backed) — see src/stores/sessionStore.ts.
    await page.addInitScript(
      ({ sessionId, memberId, sessionToken, tableNumber }) => {
        window.sessionStorage.setItem(
          'table-session',
          JSON.stringify({
            state: { sessionId, memberId, sessionToken, tableNumber },
            version: 0,
          }),
        );
      },
      {
        sessionId: E2E_TABLE_SESSION_ID,
        memberId: E2E_MEMBER_ID,
        sessionToken: E2E_SESSION_TOKEN,
        tableNumber: E2E_TABLE_NUMBER ?? '1',
      },
    );
  });

  test('browses the menu, adds an item to the cart, and submits an order', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.getByRole('heading', { name: 'เมนู' })).toBeVisible();

    // Open the first available (not "หมด"/sold-out) menu item.
    const firstItem = page
      .locator('a[href^="/menu/"]')
      .filter({ hasNot: page.getByText('หมด') })
      .first();
    await firstItem.waitFor();
    const itemName = await firstItem.locator('p').first().textContent();
    await firstItem.click();

    await page.getByRole('button', { name: /เพิ่มลงตะกร้า/ }).click();

    await page.goto('/cart');
    await expect(page.getByText(itemName ?? '', { exact: false }).first()).toBeVisible();

    await page.getByRole('button', { name: 'ยืนยันสั่งอาหาร' }).click();

    await expect(page).toHaveURL(/\/orders/);
    await expect(page.getByRole('heading', { name: 'ออเดอร์ของโต๊ะนี้' })).toBeVisible();
    await expect(page.getByText(itemName ?? '', { exact: false }).first()).toBeVisible();
  });
});
