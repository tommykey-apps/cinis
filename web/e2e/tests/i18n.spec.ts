import { test, expect } from '@playwright/test';

async function waitForHydration(page: import('@playwright/test').Page) {
	await page.waitForLoadState('networkidle');
	await page.getByLabel(/Language/i).waitFor();
}

test.describe('i18n (JA/EN)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('cinis-locale', 'en'));
		await page.reload();
		await waitForHydration(page);
	});

	test('defaults to English and switches to Japanese', async ({ page }) => {
		await expect(page.getByRole('heading', { name: /Share a one-time secret/i })).toBeVisible();

		await page.getByLabel(/Language/i).selectOption('ja');
		await expect(
			page.getByRole('heading', { name: /一度だけ読めるシークレットを共有/ })
		).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
	});

	test('persists locale across reload', async ({ page }) => {
		await page.getByLabel(/Language/i).selectOption('ja');
		await expect(page.locator('html')).toHaveAttribute('lang', 'ja');

		await page.reload();
		await waitForHydration(page);

		await expect(
			page.getByRole('heading', { name: /一度だけ読めるシークレットを共有/ })
		).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
	});
});
