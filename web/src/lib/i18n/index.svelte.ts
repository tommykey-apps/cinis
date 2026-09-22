import en from './en.json';
import ja from './ja.json';

export type Locale = 'en' | 'ja';

const messages = { en, ja } as const;

const STORAGE_KEY = 'cinis-locale';

type MessageNode = string | { [k: string]: MessageNode };

class LocaleState {
	current = $state<Locale>('en');

	set(next: Locale): void {
		this.current = next;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(STORAGE_KEY, next);
			} catch {
				// ignore storage errors
			}
			document.documentElement.lang = next;
		}
	}

	init(): void {
		if (typeof window === 'undefined') return;
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(STORAGE_KEY);
		} catch {
			// ignore
		}
		if (stored === 'en' || stored === 'ja') {
			this.set(stored);
			return;
		}
		const nav = navigator.language?.toLowerCase() ?? '';
		this.set(nav.startsWith('ja') ? 'ja' : 'en');
	}
}

export const localeState = new LocaleState();

// Convenience wrappers (for imports that don't want the instance)
export function getLocale(): Locale {
	return localeState.current;
}

export function setLocale(next: Locale): void {
	localeState.set(next);
}

export function initLocale(): void {
	localeState.init();
}

export function t(key: string, params?: Record<string, string | number>): string {
	const parts = key.split('.');
	let node: MessageNode = messages[localeState.current];
	for (const p of parts) {
		if (typeof node === 'string') return key;
		node = node[p];
		if (node === undefined) return key;
	}
	if (typeof node !== 'string') return key;
	if (!params) return node;
	return node.replace(/\{(\w+)\}/g, (_, k) => {
		const v = params[k];
		return v === undefined ? `{${k}}` : String(v);
	});
}
