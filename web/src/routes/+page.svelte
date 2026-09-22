<script lang="ts">
	import { encrypt } from '$lib/crypto';
	import { createNote } from '$lib/api';
	import { t } from '$lib/i18n/index.svelte';

	const MAX_LENGTH = 8000;

	let plaintext = $state('');
	let expiresIn = $state(3600);
	let url = $state<string | null>(null);
	let submitting = $state(false);
	let error = $state<string | null>(null);
	let copied = $state(false);

	const expiryOptions = [
		{ key: '5m', value: 300 },
		{ key: '1h', value: 3600 },
		{ key: '1d', value: 86400 },
		{ key: '7d', value: 604800 }
	] as const;

	const exceeded = $derived(plaintext.length > MAX_LENGTH);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!plaintext.trim() || exceeded) return;
		submitting = true;
		error = null;
		copied = false;
		try {
			const { ciphertext, iv, key } = await encrypt(plaintext);
			const res = await createNote(ciphertext, iv, expiresIn);
			url = `${location.origin}/s/${res.id}#${key}`;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			submitting = false;
		}
	}

	async function copyUrl() {
		if (!url) return;
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function reset() {
		plaintext = '';
		url = null;
		error = null;
		copied = false;
	}
</script>

<h1 class="dads-u-std-28B-150 mb-6">{t('create.heading')}</h1>

{#if url}
	<div class="dads-notification-banner" data-style="standard" data-type="success" role="status">
		<h2 class="dads-notification-banner__heading">
			<svg class="dads-notification-banner__icon" width="24" height="24" viewBox="0 0 24 24" role="img" aria-label="OK">
				<circle cx="12" cy="12" r="10" fill="currentcolor" />
				<path d="m17.6 9.6-7 7-4.3-4.3L7.7 11l2.9 2.9 5.7-5.6 1.3 1.4Z" fill="Canvas" />
			</svg>
			<span class="dads-notification-banner__heading-text">{t('create.result_title')}</span>
		</h2>
		<div class="dads-notification-banner__body">
			<p>{t('create.result_note')}</p>
			<div class="dads-form-control-label" data-size="sm">
				<label class="dads-form-control-label__label" for="share-url">{t('create.result_label')}</label>
				<span class="dads-input-text">
					<input
						id="share-url"
						class="dads-input-text__input share-url"
						type="text"
						data-size="md"
						readonly
						value={url}
						onclick={(e) => (e.currentTarget as HTMLInputElement).select()}
					/>
				</span>
			</div>
		</div>
		<div class="dads-notification-banner__actions">
			<button class="dads-button" type="button" data-type="text" data-size="md" onclick={reset}>
				{t('create.reset')}
			</button>
			<button class="dads-button" type="button" data-type="outline" data-size="md" onclick={copyUrl}>
				{copied ? t('create.copied') : t('create.copy')}
			</button>
		</div>
	</div>
{:else}
	<form onsubmit={handleSubmit} novalidate class="flex flex-col gap-8">
		<div class="dads-form-control-label" data-size="md">
			<label class="dads-form-control-label__label" for="secret">
				{t('create.label_secret')}
				<span class="dads-form-control-label__requirement" data-required="true">{t('create.required')}</span>
			</label>
			<p id="secret-support" class="dads-form-control-label__support-text">{t('create.secret_support')}</p>
			<span class="dads-textarea">
				<textarea
					id="secret"
					class="dads-textarea__textarea w-full"
					rows="8"
					bind:value={plaintext}
					aria-required="true"
					aria-invalid={error || exceeded ? 'true' : undefined}
					aria-describedby={error ? 'secret-error secret-counter secret-support' : 'secret-counter secret-support'}
				></textarea>
				<span id="secret-counter" class="dads-textarea__counter" data-exceeded={exceeded ? '' : undefined}>
					{t('create.counter', { count: plaintext.length.toLocaleString(), max: MAX_LENGTH.toLocaleString() })}
				</span>
				{#if error}
					<span id="secret-error" class="dads-textarea__error-text" role="alert">{error}</span>
				{/if}
			</span>
		</div>

		<div class="dads-form-control-label" data-size="md">
			<label class="dads-form-control-label__label" for="expires">{t('create.label_expires')}</label>
			<p id="expires-support" class="dads-form-control-label__support-text">{t('create.expires_support')}</p>
			<span class="dads-select">
				<span class="dads-select__control">
					<select id="expires" class="dads-select__select" data-size="md" bind:value={expiresIn} aria-describedby="expires-support">
						{#each expiryOptions as opt (opt.key)}
							<option value={opt.value}>{t(`create.expiry.${opt.key}`)}</option>
						{/each}
					</select>
					<svg class="dads-select__chevron" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M12 17L3 8L4 7L12 15L20 7L21 8L12 17Z" fill="currentcolor" />
					</svg>
				</span>
			</span>
		</div>

		<div>
			<button
				class="dads-button"
				type="submit"
				data-type="solid-fill"
				data-size="lg"
				disabled={submitting || !plaintext.trim() || exceeded}
			>
				{submitting ? t('create.submitting') : t('create.submit')}
			</button>
		</div>
	</form>
{/if}

<style>
	.share-url {
		width: 100%;
		font-family: var(--font-family-mono);
	}
</style>
