import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.use({ viewport: { width: 1920, height: 1080 } });
test('take screenshot', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('http://localhost:5173');

  const emailContent = fs.readFileSync('tests/test_email.html', 'utf-8');
  await page.locator('textarea[placeholder="Paste your Matt Levine Money Stuff email here..."]').fill(emailContent);
  await page.getByRole('button', { name: 'Parse Email' }).click();
  await page.waitForSelector('text="[1]"');
  await page.locator('text="[1]"').click();
  await page.screenshot({ path: 'screenshot_with_popover.png' });
});
