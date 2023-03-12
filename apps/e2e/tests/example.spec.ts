import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4200/example');
  await expect(page.locator('li:first-child.kbd-sort-item')).toBeTruthy();
  await page.waitForSelector('input:focus');
  await page.press('input', 'Tab');
  await expect(page.locator('li:first-child')).toContainText('A');
  await expect(page.locator('li:first-child')).toBeFocused();
  await page.locator('li:first-child').dispatchEvent('keydown', {
    key: 'Enter',
  });
  await expect(page.locator('li:first-child')).toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
  await page.locator('li:first-child').dispatchEvent('keydown', {
    key: 'ArrowRight',
  });
  await expect(page.locator('li:nth-child(2)')).toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
  await expect(page.locator('li:first-child')).toContainText('B');
  await expect(page.locator('li:nth-child(2)')).toContainText('A');
  await expect(page.locator('li:nth-child(2)')).toBeFocused();
  await page.locator('li:nth-child(2)').dispatchEvent('keydown', {
    key: 'Enter',
  });
  await expect(page.locator('li:nth-child(2)')).not.toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
});
