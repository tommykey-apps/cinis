<script lang="ts">
	import { themeState, type Theme } from '$lib/theme.svelte';
	import { t } from '$lib/i18n/index.svelte';

	function onChange(e: Event) {
		const v = (e.currentTarget as HTMLSelectElement).value as Theme;
		themeState.set(v);
	}
</script>

<div class="flex items-center gap-2">
	<label for="theme-select" class="switcher-label">{t('theme.label')}</label>
	<span class="dads-select">
		<span class="dads-select__control">
			<select id="theme-select" class="dads-select__select" data-size="sm" onchange={onChange}>
				<option value="system" selected={themeState.current === 'system'}>{t('theme.system')}</option>
				<option value="light" selected={themeState.current === 'light'}>{t('theme.light')}</option>
				<option value="dark" selected={themeState.current === 'dark'}>{t('theme.dark')}</option>
			</select>
			<svg class="dads-select__chevron" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 17L3 8L4 7L12 15L20 7L21 8L12 17Z" fill="currentcolor" />
			</svg>
		</span>
	</span>
</div>

<style>
	.switcher-label {
		color: var(--cinis-text-sub);
	}
</style>
