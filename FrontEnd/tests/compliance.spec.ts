import { test, expect } from '@playwright/test';

test.describe('Website Compliance & Standards', () => {

  test('Compliance: Restricts login email to @gmail.com domain', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('#email').fill('developer@yahoo.com');
    await page.locator('#password').fill('securepass123');
    await page.locator('#login-submit-btn').click();

    const errorAlert = page.locator('#InvalidCreds');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Only @gmail.com addresses are permitted.');
  });

  test('Compliance: Password input is masked for security', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('required', '');

    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('Compliance: GitHub OAuth sign-in button is displayed and interactive', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const githubBtn = page.locator('#github-signin-btn');
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toBeEnabled();
    await expect(githubBtn).toContainText('Continue with GitHub');

    // Confirm GitHub SVG icon is rendered inside button
    await expect(githubBtn.locator('svg')).toBeVisible();
  });

  test('Compliance: Navigation from login to forgot-password page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const forgotLink = page.locator('a[href="/forgot-password"]');
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('Compliance: Forgot password request issues confirmation to admin', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText('Reset Password');

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('support@gmail.com');

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toContainText('Send Reset Request');
    await submitBtn.click();

    const confirmationBanner = page.getByText('A reset notification has been sent to the Admin');
    await expect(confirmationBanner).toBeVisible();
    await expect(confirmationBanner).toContainText('support@gmail.com');
  });

  test('Compliance: Login branding and structure adheres to specification', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Branding header checks
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.locator('text=Bug Tracking System')).toBeVisible();

    // Submit button branding
    const submitBtn = page.locator('#login-submit-btn');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Log In');
  });

});
