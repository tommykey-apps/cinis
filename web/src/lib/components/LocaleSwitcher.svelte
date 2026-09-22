<script lang="ts">
	import { localeState, type Locale } from '$lib/i18n/index.svelte';

	function onChange(e: Event) {
		const v = (e.currentTarget as HTMLSelectElement).value as Locale;
		localeState.set(v);
	}
</script>

<div class="flex items-center gap-2">
	<label for="locale-select" class="locale-label">Language</label>
	<span class="dads-select">
		<span class="dads-select__control">
			<select id="locale-select" class="dads-select__select" data-size="sm" onchange={onChange}>
				<option value="ja" lang="ja" selected={localeState.current === 'ja'}>日本語</option>
				<option value="en" lang="en" selected={localeState.current === 'en'}>English</option>
			</select>
			<svg class="dads-select__chevron" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 17L3 8L4 7L12 15L20 7L21 8L12 17Z" fill="currentcolor" />
			</svg>
		</span>
	</span>
</div>

<style>
	.locale-label {
		color: var(--color-neutral-solid-gray-600);
	}
</style>
