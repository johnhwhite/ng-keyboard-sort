import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/example-with-handles');
  await expect(page.locator('main li:first-child.kbd-sort-item')).toBeTruthy();
  await page.waitForSelector('main input:focus');
  await page.press('main input', 'Tab');
  await expect(page.locator('main li:first-child .handle')).toBeFocused();
  await expect(page.locator('main li:first-child')).toContainText('Item 1');
  await page.locator('main li:first-child .handle').dispatchEvent('keydown', {
    key: 'Enter',
  });
  await expect(page.locator('main li:first-child')).toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
  await page.locator('main li:first-child .handle').dispatchEvent('keydown', {
    key: 'ArrowDown',
  });
  await expect(page.locator('main li:nth-child(2) .handle')).toBeFocused();
  await expect(page.locator('main li:nth-child(2)')).toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
  await expect(page.locator('main li:first-child')).toContainText('Item 2');
  await expect(page.locator('main li:nth-child(2)')).toContainText('Item 1');
  await page.locator('main li:nth-child(2) .handle').dispatchEvent('keydown', {
    key: 'Enter',
  });
  await expect(page.locator('main li:nth-child(2)')).not.toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
});
