import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('strips gmail wrapper and keeps newsletter content', async ({ page }) => {
  await page.goto('http://localhost:5173');

  const wrapperContent = fs.readFileSync('tests/wrapper_sample.html', 'utf-8');

  await page.locator('textarea[placeholder="Paste your Matt Levine Money Stuff email here..."]').fill(wrapperContent);

  await page.getByRole('button', { name: 'Parse Email' }).click();

  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();

  // Assertions

  // 1. "Gmail" logo should NOT be present (Confirmed to pass previously)
  await expect(page.getByAltText('Gmail')).not.toBeVisible();

  // 2. The forwarding sender email should NOT be present
  // "Bojan Baros" matches the app header, so check for the email address which is in the wrapper
  await expect(page.getByText('bbaros@gmail.com')).not.toBeVisible();

  // 3. The subject line from the wrapper should NOT be present (Strictly newsletter content)
  // "Money Stuff: MoviePass Is Back With Betting" is in the wrapper outside the table
  await expect(page.getByText('Money Stuff: MoviePass Is Back With Betting')).not.toBeVisible();

  // 4. The newsletter content "MoviePass Economy II" SHOULD be present as a heading
  await expect(page.getByRole('heading', { name: 'MoviePass Economy II' })).toBeVisible();

  // 5. "View in browser" link (inside the extracted wrapper table) SHOULD be present
  await expect(page.getByText('View in browser')).toBeVisible();
});
