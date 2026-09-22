import { test, expect } from '@playwright/test';

async function waitForHydration(page: import('@playwright/test').Page) {
	await page.waitForLoadState('networkidle');
	await page.getByLabel(/Language/i).waitFor();
}

test.describe('One-time secret flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('cinis-locale', 'en'));
		await page.reload();
		await waitForHydration(page);
	});

	test('golden path: create → reveal → gone', async ({ browser, page }) => {
		const plaintext = `top secret ${crypto.randomUUID()}`;

		await expect(page.getByRole('heading', { name: /Share a one-time secret/i })).toBeVisible();
		await page.getByLabel(/^Secret/i).fill(plaintext);
		await page.getByLabel(/Expires in/i).selectOption('3600');
		await page.getByRole('button', { name: /Create one-time URL/i }).click();

		const urlInput = page.locator('input[readonly]');
		await expect(urlInput).toBeVisible({ timeout: 10_000 });
		const shareUrl = await urlInput.inputValue();
		expect(shareUrl).toMatch(/\/s\/[A-Za-z0-9_-]+#[A-Za-z0-9_-]+$/);

		// Open in a fresh context (different browser state) to act as recipient
		const recipientCtx = await browser.newContext();
		const recipientPage = await recipientCtx.newPage();
		await recipientPage.goto(shareUrl);
		await recipientPage.evaluate(() => localStorage.setItem('cinis-locale', 'en'));
		// Re-navigate to the share URL (reload would strip the hash through setLocale)
		await recipientPage.goto(shareUrl);
		await waitForHydration(recipientPage);

		await expect(
			recipientPage.getByRole('heading', { name: /A secret is waiting for you/i })
		).toBeVisible({ timeout: 10_000 });
		await recipientPage.getByRole('button', { name: /Reveal once/i }).click();

		const revealed = recipientPage.locator('pre');
		await expect(revealed).toHaveText(plaintext, { timeout: 10_000 });

		// Re-visit the URL in another new context → server should 410
		const secondCtx = await browser.newContext();
		const secondPage = await secondCtx.newPage();
		await secondPage.goto(shareUrl);
		await secondPage.evaluate(() => localStorage.setItem('cinis-locale', 'en'));
		await secondPage.goto(shareUrl);
		await waitForHydration(secondPage);
		await expect(
			secondPage.getByRole('heading', { name: /This secret is gone/i })
		).toBeVisible({ timeout: 10_000 });

		await recipientCtx.close();
		await secondCtx.close();
	});

	test('no-key: fragment missing shows warning', async ({ page }) => {
		await page.goto('/s/abcdef0123456789');
		await waitForHydration(page);
		await expect(page.getByRole('heading', { name: /No key in URL/i })).toBeVisible();
	});

	test('copy button flips to "Copied!" state', async ({ page, browserName, context }) => {
		test.skip(browserName !== 'chromium', 'clipboard API needs permission handling');

		await context.grantPermissions(['clipboard-read', 'clipboard-write']);

		await page.getByLabel(/^Secret/i).fill('hello');
		await page.getByRole('button', { name: /Create one-time URL/i }).click();
		await expect(page.locator('input[readonly]')).toBeVisible({ timeout: 10_000 });

		await page.getByRole('button', { name: /^Copy$/ }).click();
		await expect(page.getByRole('button', { name: /^Copied!$/ })).toBeVisible();
	});
});
