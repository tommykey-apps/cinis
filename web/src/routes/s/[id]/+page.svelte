<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { consumeNote, existsNote } from '$lib/api';
	import { decrypt } from '$lib/crypto';
	import { t } from '$lib/i18n/index.svelte';

	type View =
		| { kind: 'checking' }
		| { kind: 'ready' }
		| { kind: 'gone' }
		| { kind: 'no-key' }
		| { kind: 'revealing' }
		| { kind: 'revealed'; text: string }
		| { kind: 'error'; message: string };

	let view = $state<View>({ kind: 'checking' });
	let keyFragment = $state('');

	const noteId = $derived(page.params.id ?? '');

	onMount(async () => {
		keyFragment = location.hash.replace(/^#/, '');
		if (!keyFragment) {
			view = { kind: 'no-key' };
			return;
		}
		if (!noteId) {
			view = { kind: 'gone' };
			return;
		}
		const ok = await existsNote(noteId);
		view = ok ? { kind: 'ready' } : { kind: 'gone' };
	});

	async function reveal() {
		view = { kind: 'revealing' };
		try {
			const r = await consumeNote(noteId);
			if (r === 'gone') {
				view = { kind: 'gone' };
				return;
			}
			const text = await decrypt(r.ciphertext, r.iv, keyFragment);
			view = { kind: 'revealed', text };
			history.replaceState(null, '', location.pathname);
		} catch (err) {
			view = { kind: 'error', message: err instanceof Error ? err.message : String(err) };
		}
	}
</script>

{#snippet errorIcon()}
	<svg class="dads-notification-banner__icon" width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="Error">
		<path d="M8.25 21 3 15.75v-7.5L8.25 3h7.5L21 8.25v7.5L15.75 21h-7.5Z" fill="currentcolor" />
		<path d="m12 13.4-2.85 2.85-1.4-1.4L10.6 12 7.75 9.15l1.4-1.4L12 10.6l2.85-2.85 1.4 1.4L13.4 12l2.85 2.85-1.4 1.4L12 13.4Z" fill="Canvas" />
	</svg>
{/snippet}

{#snippet infoIcon()}
	<svg class="dads-notification-banner__icon" width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="Info">
		<circle cx="12" cy="12" r="10" fill="currentcolor" />
		<path d="M11 10h2v7h-2v-7Zm0-3h2v2h-2V7Z" fill="Canvas" />
	</svg>
{/snippet}

{#snippet successIcon()}
	<svg class="dads-notification-banner__icon" width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="OK">
		<circle cx="12" cy="12" r="10" fill="currentcolor" />
		<path d="m17.6 9.6-7 7-4.3-4.3L7.7 11l2.9 2.9 5.7-5.6 1.3 1.4Z" fill="Canvas" />
	</svg>
{/snippet}

{#if view.kind === 'checking'}
	<p role="status">{t('reveal.checking')}</p>
{:else if view.kind === 'no-key'}
	<div class="dads-notification-banner" data-style="standard" data-type="error" role="alert">
		<h1 class="dads-notification-banner__heading">
			{@render errorIcon()}
			<span class="dads-notification-banner__heading-text">{t('reveal.no_key_title')}</span>
		</h1>
		<div class="dads-notification-banner__body">
			<p>{t('reveal.no_key_body')}</p>
		</div>
	</div>
{:else if view.kind === 'gone'}
	<div class="dads-notification-banner" data-style="standard" data-type="info-2" role="status">
		<h1 class="dads-notification-banner__heading">
			{@render infoIcon()}
			<span class="dads-notification-banner__heading-text">{t('reveal.gone_title')}</span>
		</h1>
		<div class="dads-notification-banner__body">
			<p>{t('reveal.gone_body')}</p>
		</div>
	</div>
{:else if view.kind === 'ready'}
	<h1 class="dads-u-std-28B-150 mb-4">{t('reveal.ready_title')}</h1>
	<p class="mb-6">{t('reveal.ready_body')}</p>
	<button class="dads-button" type="button" data-type="solid-fill" data-size="lg" onclick={reveal}>
		{t('reveal.reveal_button')}
	</button>
{:else if view.kind === 'revealing'}
	<p role="status">{t('reveal.revealing')}</p>
{:else if view.kind === 'revealed'}
	<div class="dads-notification-banner" data-style="standard" data-type="success" role="status">
		<h1 class="dads-notification-banner__heading">
			{@render successIcon()}
			<span class="dads-notification-banner__heading-text">{t('reveal.destroyed_title')}</span>
		</h1>
		<div class="dads-notification-banner__body">
			<p>{t('reveal.destroyed_note')}</p>
			<pre class="secret-text">{view.text}</pre>
		</div>
	</div>
{:else if view.kind === 'error'}
	<div class="dads-notification-banner" data-style="standard" data-type="error" role="alert">
		<h1 class="dads-notification-banner__heading">
			{@render errorIcon()}
			<span class="dads-notification-banner__heading-text">{t('reveal.error_title')}</span>
		</h1>
		<div class="dads-notification-banner__body">
			<p>{t('reveal.error_body')}</p>
			<p class="detail">{view.message}</p>
		</div>
	</div>
{/if}

<style>
	.secret-text {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		border: 1px solid var(--color-neutral-solid-gray-600);
		border-radius: var(--border-radius-8);
		background-color: var(--color-neutral-white);
		padding: 1rem;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-16);
		line-height: var(--line-height-170);
		color: var(--color-neutral-solid-gray-900);
	}

	.detail {
		color: var(--color-neutral-solid-gray-600);
		font-family: var(--font-family-mono);
	}
</style>
