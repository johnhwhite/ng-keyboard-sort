import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4200/example-with-handles');
  await expect(page.locator('li:first-child.kbd-sort-item')).toBeTruthy();
  await page.waitForSelector('input:focus');
  await page.press('input', 'Tab');
  await expect(page.locator('li:first-child')).toContainText('Item 1');
  await expect(page.locator('li:first-child .handle')).toBeFocused();
  await expect(page.locator('li:first-child')).toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
  await page.locator('li:first-child .handle').dispatchEvent('keydown', {
    key: 'ArrowDown',
  });
  await expect(page.locator('li:nth-child(2)')).toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
  await expect(page.locator('li:first-child')).toContainText('Item 2');
  await expect(page.locator('li:nth-child(2)')).toContainText('Item 1');
  await expect(page.locator('li:nth-child(2) .handle')).toBeFocused();
  await page.locator('li:nth-child(2) .handle').dispatchEvent('keydown', {
    key: 'Enter',
  });
  await expect(page.locator('li:nth-child(2)')).not.toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
});
