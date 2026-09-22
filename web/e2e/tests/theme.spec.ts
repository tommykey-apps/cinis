import { test, expect } from '@playwright/test';

const DARK_BG = 'rgb(26, 26, 26)'; // --color-neutral-solid-gray-900
const LIGHT_BG = 'rgb(255, 255, 255)'; // --color-neutral-white

async function waitForHydration(page: import('@playwright/test').Page) {
	await page.waitForLoadState('networkidle');
	await page.getByLabel(/Theme/i).waitFor();
}

function bodyBg(page: import('@playwright/test').Page) {
	return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

test.describe('Theme (system / light / dark)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => {
			localStorage.setItem('cinis-locale', 'en');
			localStorage.removeItem('cinis-theme');
		});
		await page.reload();
		await waitForHydration(page);
	});

	test('follows the device setting by default', async ({ page }) => {
		await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);

		await page.emulateMedia({ colorScheme: 'dark' });
		expect(await bodyBg(page)).toBe(DARK_BG);

		await page.emulateMedia({ colorScheme: 'light' });
		expect(await bodyBg(page)).toBe(LIGHT_BG);
	});

	test('manual choice overrides the device setting and persists', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });

		await page.getByLabel(/Theme/i).selectOption('light');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
		expect(await bodyBg(page)).toBe(LIGHT_BG);

		await page.getByLabel(/Theme/i).selectOption('dark');
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
		expect(await bodyBg(page)).toBe(DARK_BG);

		await page.emulateMedia({ colorScheme: 'light' });
		await page.reload();
		await waitForHydration(page);
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
		expect(await bodyBg(page)).toBe(DARK_BG);

		await page.getByLabel(/Theme/i).selectOption('system');
		await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
		expect(await bodyBg(page)).toBe(LIGHT_BG);
	});
});
