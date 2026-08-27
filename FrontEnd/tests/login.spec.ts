import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('Successfully logged in with valid credentials!', async({page}) => {
    await page.goto('/login');

    await page.locator('#email').fill('test01@gmail.com');
    await page.locator('#password').fill('password@1');

    await page.locator('#login-submit-btn').click();

    await expect(page).toHaveURL('/dashboard');
  });
});