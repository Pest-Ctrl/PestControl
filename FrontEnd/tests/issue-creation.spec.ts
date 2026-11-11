import { test, expect } from '@playwright/test';

test.describe('Issue Creation Workflow (/space)', () => {

  const mockRepos = [
    {
      RepoID: 'test-repo-uuid-1',
      GHOwner: 'octocat',
      GHName: 'Hello-World',
      FileTree: [
        { path: 'src/components/Header.tsx', type: 'blob' },
        { path: 'src/index.ts', type: 'blob' },
      ],
    },
  ];

  const mockCommits = [
    {
      CommitID: 'test-commit-uuid-1',
      SHA: '1234567890abcdef',
      Message: 'Fix header layout',
      RepoID: 'test-repo-uuid-1',
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock repositories API
    await page.route('**/api/repos', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRepos),
        });
      } else {
        await route.continue();
      }
    });

    // Mock commits API
    await page.route('**/api/commits*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCommits),
      });
    });
  });

  test('Form validation: File Issue button is disabled until mandatory fields are filled', async ({ page }) => {
    await page.goto('/space');
    await page.waitForLoadState('domcontentloaded');

    const submitBtn = page.locator('#issue-submit-btn');

    // Initially disabled
    await expect(submitBtn).toBeDisabled();

    // Fill Title only -> still disabled
    await page.locator('#issue-title-input').fill('Sample defect title');
    await expect(submitBtn).toBeDisabled();

    // Fill Description -> still disabled (no repo/commit selected)
    await page.locator('#issue-description-input').fill('Steps to reproduce this defect...');
    await expect(submitBtn).toBeDisabled();

    // Select Repository -> still disabled (no commit selected)
    await page.locator('#issue-repo-select').selectOption('test-repo-uuid-1');
    await expect(submitBtn).toBeDisabled();

    // Select Commit -> now all required fields are present, button should be enabled
    await page.locator('#issue-commit-select').selectOption('test-commit-uuid-1');
    await expect(submitBtn).toBeEnabled();
  });

  test('Successfully creates an issue and displays confirmation banner', async ({ page }) => {
    let capturedPayload: any = null;

    // Mock issues API for creation
    await page.route('**/api/issues', async (route) => {
      if (route.request().method() === 'POST') {
        capturedPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            IssueID: 'created-issue-uuid-123',
            Title: capturedPayload.title,
            Description: capturedPayload.description,
            Severity: capturedPayload.severity,
            BugType: capturedPayload.bugType,
            RepoID: capturedPayload.repoId,
            CommitID: capturedPayload.commitId,
            CreatedAt: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/space');
    await page.waitForLoadState('domcontentloaded');

    // Fill in Issue Details
    await page.locator('#issue-title-input').fill('Critical UI alignment bug in navigation bar');
    await page.locator('#issue-description-input').fill('The navigation bar shifts 20px to the left on mobile viewports.');
    await page.locator('#issue-severity-select').selectOption('High');
    await page.locator('#issue-bug-type-select').selectOption('UI');

    // Select Repository and Commit
    await page.locator('#issue-repo-select').selectOption('test-repo-uuid-1');
    await page.locator('#issue-commit-select').selectOption('test-commit-uuid-1');

    // Optional File Path, Line Range, and Environment
    await page.locator('#issue-file-path-input').fill('src/components/Header.tsx');
    await page.locator('#issue-line-range-input').fill('45-62');
    await page.locator('#issue-environment-input').fill('Chrome 128 / macOS 15');

    // Click submit
    const submitBtn = page.locator('#issue-submit-btn');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify submitted payload
    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload.title).toBe('Critical UI alignment bug in navigation bar');
    expect(capturedPayload.severity).toBe('High');
    expect(capturedPayload.bugType).toBe('UI');
    expect(capturedPayload.repoId).toBe('test-repo-uuid-1');
    expect(capturedPayload.commitId).toBe('test-commit-uuid-1');
    expect(capturedPayload.filePath).toBe('src/components/Header.tsx');
    expect(capturedPayload.lineRange).toBe('45-62');
    expect(capturedPayload.description).toContain('Chrome 128 / macOS 15');

    // Verify success banner is displayed
    const successBanner = page.locator('#issue-success-banner');
    await expect(successBanner).toBeVisible();
    await expect(successBanner).toContainText('Issue Created Successfully');
    await expect(successBanner).toContainText('Redirecting to issues board...');
  });

  test('Displays error message when backend returns an error', async ({ page }) => {
    // Mock issues API with failure
    await page.route('**/api/issues', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database transaction failed' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/space');
    await page.waitForLoadState('domcontentloaded');

    // Fill in required fields
    await page.locator('#issue-title-input').fill('Test Error Handling');
    await page.locator('#issue-description-input').fill('Verifying error alert rendering');
    await page.locator('#issue-repo-select').selectOption('test-repo-uuid-1');
    await page.locator('#issue-commit-select').selectOption('test-commit-uuid-1');

    // Submit
    const submitBtn = page.locator('#issue-submit-btn');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify error banner is rendered
    const errorBanner = page.locator('#issue-error-banner');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Database transaction failed');
  });

});

