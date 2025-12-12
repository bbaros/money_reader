import { test, expect } from '@playwright/test';

test('has paste and parse button', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Check for the new button label "Paste & Parse"
  await expect(page.getByRole('button', { name: 'Paste & Parse' })).toBeVisible();
});
