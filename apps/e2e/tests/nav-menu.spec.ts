import { expect, test } from '@playwright/test';

test.describe('narrow viewport nav menu', () => {
  test.use({ viewport: { width: 400, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/example');
  });

  test('is collapsed by default', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Menu' });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(
      page.getByRole('link', { name: 'Example', exact: true })
    ).toBeHidden();
  });

  test('opens and closes with the keyboard', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Menu' });
    const link = page.getByRole('link', { name: 'Example', exact: true });

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(link).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(link).toBeHidden();
  });

  test('closes after following a link', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Menu' });

    await toggle.click();
    await page.getByRole('link', { name: 'Example with handles' }).click();

    await expect(page).toHaveURL(/\/example-with-handles$/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('closes after following a link to the current route', async ({
    page,
  }) => {
    const toggle = page.getByRole('button', { name: 'Menu' });

    await toggle.click();
    await page.getByRole('link', { name: 'Example', exact: true }).click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('wide viewport nav menu', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('shows links inline without a toggle', async ({ page }) => {
    await page.goto('/example');
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    await expect(
      page.getByRole('link', { name: 'Example', exact: true })
    ).toBeVisible();
  });
});
