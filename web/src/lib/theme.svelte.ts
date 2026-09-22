export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'cinis-theme';

// 表示テーマ。system は端末設定 (prefers-color-scheme) に追随し、data-theme を付けない。
// 初期描画のちらつきを防ぐため、app.html の inline script も同じ規則で data-theme を付けている。
class ThemeState {
	current = $state<Theme>('system');

	set(next: Theme): void {
		this.current = next;
		if (typeof window === 'undefined') return;
		try {
			if (next === 'system') localStorage.removeItem(STORAGE_KEY);
			else localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// ストレージが使えない環境では現在のタブだけに反映する
		}
		if (next === 'system') delete document.documentElement.dataset.theme;
		else document.documentElement.dataset.theme = next;
	}

	init(): void {
		if (typeof window === 'undefined') return;
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(STORAGE_KEY);
		} catch {
			// ignore
		}
		this.set(stored === 'light' || stored === 'dark' ? stored : 'system');
	}
}

export const themeState = new ThemeState();

export function initTheme(): void {
	themeState.init();
}
