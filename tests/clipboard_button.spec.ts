import { test, expect } from '@playwright/test';

test('has paste from clipboard button', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByRole('button', { name: 'Paste from Clipboard' })).toBeVisible();
});
