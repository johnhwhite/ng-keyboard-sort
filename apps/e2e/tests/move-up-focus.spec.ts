import { expect, test } from '@playwright/test';

test('moving an item up keeps it activated and focused, and further keyboard commands still move it', async ({
  page,
}) => {
  await page.goto('/example');
  await page.waitForSelector('main input');
  await page.focus('main input');
  await page.press('main input', 'Tab');

  // Navigate to item C (index 2) without activating.
  await page.locator('main li:first-child').dispatchEvent('keydown', {
    key: 'ArrowRight',
  });
  await page.locator('main li:nth-child(2)').dispatchEvent('keydown', {
    key: 'ArrowRight',
  });

  // Activate it.
  await page.locator('main li:nth-child(3)').dispatchEvent('keydown', {
    key: 'Enter',
  });
  await expect(page.locator('main li:nth-child(3)')).toHaveClass(
    /\bkbd-sort-item-activated\b/
  );

  // Move it up once: C should now be at index 1, still activated and focused.
  await page.locator('main li:nth-child(3)').dispatchEvent('keydown', {
    key: 'ArrowLeft',
  });
  await expect(page.locator('main li:nth-child(2)')).toContainText('C');
  await expect(page.locator('main li:nth-child(2)')).toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
  await expect(page.locator('main li:nth-child(2)')).toBeFocused();

  // Move it up again via a real keyboard command: should keep moving, not
  // just navigate focus (which is what happens if it silently deactivated).
  await page.locator('main li:nth-child(2)').dispatchEvent('keydown', {
    key: 'ArrowLeft',
  });
  await expect(page.locator('main li:first-child')).toContainText('C');
  await expect(page.locator('main li:first-child')).toHaveClass(
    /\bkbd-sort-item-activated\b/
  );
  await expect(page.locator('main li:first-child')).toBeFocused();
});
