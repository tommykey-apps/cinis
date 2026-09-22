<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import LocaleSwitcher from '$lib/components/LocaleSwitcher.svelte';
	import { initLocale, t } from '$lib/i18n/index.svelte';

	let { children } = $props();

	onMount(() => {
		initLocale();
	});
</script>

<svelte:head>
	<title>{t('meta.title')}</title>
	<meta name="description" content={t('meta.description')} />
</svelte:head>

<div class="min-h-screen">
	<header class="site-header">
		<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4">
			<a href="/" class="site-title dads-u-std-20B-150">cinis</a>
			<LocaleSwitcher />
		</div>
	</header>
	<main class="mx-auto max-w-3xl px-4 py-8">
		{@render children()}
	</main>
	<footer class="site-footer mx-auto max-w-3xl px-4 py-6">
		<p>{t('footer.note')}</p>
	</footer>
</div>

<style>
	.site-header {
		border-bottom: 1px solid var(--color-neutral-solid-gray-200);
		padding-top: 0.75rem;
		padding-bottom: 0.75rem;
	}

	.site-title {
		color: var(--color-neutral-solid-gray-900);
		text-decoration: none;
	}

	.site-title:hover {
		text-decoration: underline;
	}

	.site-footer {
		border-top: 1px solid var(--color-neutral-solid-gray-200);
		color: var(--color-neutral-solid-gray-600);
	}
</style>
