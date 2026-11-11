import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('Successfully logged in with valid credentials!', async({ page, request }) => {
    // Check if local backend service is online
    let backendAvailable = false;
    try {
      const res = await request.get('http://localhost:8080/api/users', { timeout: 1000 });
      backendAvailable = res.ok();
    } catch {
      backendAvailable = false;
    }

    test.skip(!backendAvailable, 'Requires live backend on http://localhost:8080');

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('#email').fill('test01@gmail.com');
    await page.locator('#password').fill('password@1');

    await page.locator('#login-submit-btn').click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('Unable to log in due to invalid credentials!', async({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill('test01@gmail.com');
    await page.locator('#password').fill('youshallnotpass');

    await page.locator('#login-submit-btn').click();

    await expect(page.locator('#InvalidCreds')).toBeVisible();
  });
});
