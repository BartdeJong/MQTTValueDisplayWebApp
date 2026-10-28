<script>
	import { onMount } from "svelte";
	import { DEFAULT_LOCATIONS, formatLocationsCookie, parseLocationsCookie } from "../utils/locations.mjs";
	import { getSensors } from "../utils/sensorApi.mjs";

	let { onCancel, onSaved } = $props();
	let locations = $state(DEFAULT_LOCATIONS.map(location => ({ ...location })));
	let newLocationName = $state("");
	let possibleLocations = $state([]);
	let selected = $state("");
	let isLoading = $state(false);
	let loadError = $state("");
	let formError = $state("");
	let saveError = $state("");
	let abortController;

	onMount(() => {
		try {
			const savedLocations = parseLocationsCookie(document.cookie);
			if (savedLocations) locations = savedLocations;
		} catch (error) {
			saveError = `${error.message} Controleer de lijst voordat je deze opslaat.`;
			console.error("Saved locations could not be loaded:", error);
		}

		void getLocations();
		return () => abortController?.abort();
	});

	async function getLocations() {
		abortController?.abort();
		const controller = new AbortController();
		abortController = controller;
		isLoading = true;
		loadError = "";
		try {
			const available = await getSensors({ signal: controller.signal });
			if (controller.signal.aborted) return;
			const existing = new Set(locations.map(location => location.deviceId));
			possibleLocations = available
				.filter(sensor => !existing.has(sensor.sensorId))
				.map((sensor, index) => ({
					text: sensor.sensorId,
					id: `available-location-${index}`,
				}));
		} catch (error) {
			if (error.name !== "AbortError" && !controller.signal.aborted) {
				loadError = "Beschikbare sensoren ophalen mislukt. Probeer het later opnieuw.";
				console.error("Available locations request failed:", error);
			}
		} finally {
			if (!controller.signal.aborted) isLoading = false;
		}
	}

	function addLocation(event) {
		event.preventDefault();
		formError = "";
		const deviceId = selected.trim();
		const name = newLocationName.trim() || deviceId;
		if (!deviceId) {
			formError = "Selecteer eerst een sensor.";
			return;
		}
		if (locations.some(location => location.deviceId === deviceId)) {
			formError = "Deze sensor is al toegevoegd.";
			return;
		}
		if (!name || name.length > 80) {
			formError = "De weergavenaam moet tussen 1 en 80 tekens bevatten.";
			return;
		}

		locations = [...locations, { name, deviceId }];
		newLocationName = "";
		selected = "";
		possibleLocations = possibleLocations.filter(location => location.text !== deviceId);
	}

	function removeLocation(deviceId) {
		const location = locations.find(item => item.deviceId === deviceId);
		if (!location || !window.confirm(`Locatie "${location.name}" verwijderen?`)) return;
		locations = locations.filter(item => item.deviceId !== deviceId);
	}

	function saveAndReturn() {
		try {
			document.cookie = formatLocationsCookie(
				locations,
				window.location.protocol === "https:"
			);
			onSaved();
		} catch (error) {
			saveError = "De locaties konden niet worden opgeslagen.";
			console.error("Locations could not be saved:", error);
		}
	}
</script>

<main class="locations-page">
	<header class="topbar">
		<a class="brand" href="#/" aria-label="MQTT Waarden dashboard">
			<span class="brand-mark" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none">
					<path d="M12 3v10.2a3.8 3.8 0 1 0 3 3.7V3a1.5 1.5 0 0 0-3 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M10 7h2M10 10h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
				</svg>
			</span>
			<span class="brand-name">MQTT Waarden</span>
		</a>
		<button class="button button--secondary" type="button" onclick={onCancel}>
			<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="m14.5 5-7 7 7 7M8 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			Dashboard
		</button>
	</header>

	<section class="page-intro">
		<p class="eyebrow">INSTELLINGEN</p>
		<h1>Locaties beheren</h1>
		<p>Kies welke sensoren je wilt volgen en geef ze een herkenbare naam.</p>
	</section>

	<div class="location-layout">
		<section class="panel add-panel" aria-labelledby="add-location-heading">
			<div class="panel-heading">
				<span class="step-number" aria-hidden="true">＋</span>
				<div>
					<h2 id="add-location-heading">Locatie toevoegen</h2>
					<p>Selecteer een beschikbare sensor.</p>
				</div>
			</div>

			{#if isLoading}
				<p class="inline-message" role="status">Beschikbare sensoren laden…</p>
			{:else if loadError}
				<p class="inline-message inline-message--error" role="alert">{loadError}</p>
				<button class="button button--secondary retry-button" type="button" onclick={getLocations}>Opnieuw proberen</button>
			{:else if possibleLocations.length === 0}
				<div class="no-sensors">
					<span aria-hidden="true">✓</span>
					<p>Alle beschikbare sensoren zijn al toegevoegd.</p>
				</div>
			{:else}
				<form onsubmit={addLocation}>
					<fieldset>
						<legend class="visually-hidden">Beschikbare sensor</legend>
						<div class="sensor-options">
							{#each possibleLocations as option (option.text)}
								<div class="sensor-option">
									<input
										id={option.id}
										bind:group={selected}
										type="radio"
										name="device-location"
										value={option.text}
										required
									>
									<label for={option.id}>
										<span class="radio-indicator" aria-hidden="true"></span>
										<span>{option.text}</span>
									</label>
								</div>
							{/each}
						</div>
					</fieldset>

					<div class="name-field">
						<label for="new-location-name">Weergavenaam <span>optioneel</span></label>
						<input
							id="new-location-name"
							bind:value={newLocationName}
							type="text"
							maxlength="80"
							autocomplete="off"
							placeholder="Bijvoorbeeld: Serre"
						>
					</div>

					{#if formError}
						<p class="inline-message inline-message--error" role="alert">{formError}</p>
					{/if}
					<button class="button button--primary add-button" type="submit" disabled={!selected}>
						Locatie toevoegen
						<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</form>
			{/if}
		</section>

		<section class="panel saved-panel" aria-labelledby="saved-locations-heading">
			<div class="panel-heading saved-heading">
				<span class="step-number step-number--mint" aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none">
						<path d="m5 12 4.5 4.5L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</span>
				<div>
					<h2 id="saved-locations-heading">Ingestelde locaties</h2>
					<p>{locations.length} {locations.length === 1 ? "sensor actief" : "sensoren actief"} op je dashboard.</p>
				</div>
			</div>

			{#if locations.length === 0}
				<div class="empty-list">
					<p>Je hebt nog geen locaties ingesteld.</p>
				</div>
			{:else}
				<ul class="location-list">
					{#each locations as location (location.deviceId)}
						<li class="location-item">
							<span class="location-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="none">
									<path d="M3.5 10.4 12 3l8.5 7.4v9.1a1 1 0 0 1-1 1h-5.2v-6h-4.6v6H4.5a1 1 0 0 1-1-1v-9.1Z" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</span>
							<span class="location-description">
								<strong>{location.name}</strong>
								<small>{location.deviceId}</small>
							</span>
							<button
								class="remove-button"
								type="button"
								aria-label={`Verwijder ${location.name}`}
								onclick={() => removeLocation(location.deviceId)}
							>
								<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path d="M4 7h16M10 11v6m4-6v6M6.5 7l.8 13h9.4l.8-13M9 7V4h6v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								<span class="visually-hidden">Verwijderen</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>

	{#if saveError}
		<p class="inline-message inline-message--error save-error" role="alert">{saveError}</p>
	{/if}
	<footer class="page-actions">
		<p>Je wijzigingen worden op dit apparaat opgeslagen.</p>
		<div>
			<button class="button button--secondary" type="button" onclick={onCancel}>Annuleren</button>
			<button class="button button--primary" type="button" onclick={saveAndReturn}>
				Opslaan en terug
				<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</div>
	</footer>
</main>

<style>
	.locations-page {
		width: min(100% - 48px, 1120px);
		margin: 0 auto;
		padding: 28px 0 56px;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		margin-bottom: 42px;
	}

	.brand-mark svg {
		width: 25px;
		height: 25px;
	}

	.button {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 0 16px;
		border: 1px solid transparent;
		border-radius: 11px;
		font-size: 0.88rem;
		font-weight: 650;
		cursor: pointer;
		transition: background 150ms ease, border-color 150ms ease, transform 150ms ease;
	}

	.button:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.button svg {
		width: 17px;
		height: 17px;
	}

	.button--secondary {
		border-color: var(--color-border);
		background: white;
		color: var(--color-ink);
	}

	.button--secondary:hover {
		border-color: #b8d8d1;
		background: #fafffe;
	}

	.button--primary {
		background: var(--color-primary);
		color: white;
	}

	.button--primary:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}

	.button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-intro {
		margin-bottom: 26px;
	}

	.eyebrow {
		margin: 0 0 9px;
		color: var(--color-primary);
		font-size: 0.72rem;
		font-weight: 750;
		letter-spacing: 0.12em;
	}

	.page-intro h1 {
		margin: 0;
		font-size: clamp(2rem, 4vw, 2.65rem);
		font-weight: 720;
		letter-spacing: -0.055em;
		line-height: 1.15;
	}

	.page-intro > p:last-child {
		margin: 9px 0 0;
		color: var(--color-muted);
		font-size: 0.98rem;
	}

	.location-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.12fr) minmax(340px, 0.88fr);
		align-items: start;
		gap: 18px;
	}

	.panel {
		min-width: 0;
		padding: 24px;
		border: 1px solid var(--color-border);
		border-radius: 18px;
		background: white;
		box-shadow: var(--shadow-card);
	}

	.panel-heading {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 21px;
	}

	.step-number {
		display: grid;
		width: 42px;
		height: 42px;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 13px;
		background: #e9f1ff;
		color: #466bb5;
		font-size: 1.3rem;
	}

	.step-number--mint {
		background: var(--color-accent);
		color: var(--color-primary);
	}

	.step-number svg {
		width: 21px;
		height: 21px;
	}

	.panel-heading h2 {
		margin: 0;
		font-size: 1.08rem;
		font-weight: 720;
		letter-spacing: -0.02em;
	}

	.panel-heading p {
		margin: 5px 0 0;
		color: var(--color-muted);
		font-size: 0.82rem;
	}

	fieldset {
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	.sensor-options {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 9px;
		max-height: 330px;
		overflow-y: auto;
		padding: 2px 2px 10px;
	}

	.sensor-option {
		position: relative;
		min-width: 0;
	}

	.sensor-option input {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		clip-path: inset(50%);
	}

	.sensor-option label {
		display: flex;
		min-height: 44px;
		align-items: center;
		gap: 9px;
		padding: 8px 10px;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background: #fff;
		color: #405653;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
	}

	.sensor-option label:hover {
		border-color: #acd2ca;
		background: #f9fdfb;
	}

	.radio-indicator {
		display: grid;
		width: 17px;
		height: 17px;
		flex: 0 0 auto;
		place-items: center;
		border: 1.5px solid #b4c4c0;
		border-radius: 50%;
	}

	.radio-indicator::after {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: white;
		content: "";
		transform: scale(0);
		transition: transform 120ms ease;
	}

	.sensor-option input:checked + label {
		border-color: var(--color-primary);
		background: #eff8f5;
		color: var(--color-primary-dark);
	}

	.sensor-option input:checked + label .radio-indicator {
		border-color: var(--color-primary);
		background: var(--color-primary);
	}

	.sensor-option input:checked + label .radio-indicator::after {
		transform: scale(1);
	}

	.sensor-option input:focus-visible + label {
		outline: 3px solid #28a897;
		outline-offset: 2px;
	}

	.name-field {
		margin-top: 13px;
	}

	.name-field label {
		display: flex;
		align-items: baseline;
		gap: 7px;
		font-size: 0.82rem;
		font-weight: 650;
	}

	.name-field label span {
		color: #899a97;
		font-size: 0.75rem;
		font-weight: 450;
	}

	.name-field input {
		width: 100%;
		min-height: 45px;
		margin-top: 8px;
		padding: 0 12px;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background: #fbfcfc;
		color: var(--color-ink);
	}

	.name-field input::placeholder {
		color: #9aa9a6;
	}

	.name-field input:focus {
		border-color: var(--color-primary);
		background: white;
	}

	.add-button {
		width: 100%;
		margin-top: 15px;
	}

	.inline-message {
		padding: 11px 12px;
		border-radius: 10px;
		background: #eff8f5;
		color: var(--color-primary-dark);
		font-size: 0.85rem;
	}

	.inline-message--error {
		background: #fff0ef;
		color: var(--color-danger);
	}

	.retry-button {
		width: 100%;
	}

	.no-sensors,
	.empty-list {
		display: flex;
		min-height: 130px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 20px;
		border: 1px dashed #d1dfdb;
		border-radius: 12px;
		color: var(--color-muted);
		text-align: center;
	}

	.no-sensors > span {
		display: grid;
		width: 27px;
		height: 27px;
		place-items: center;
		border-radius: 50%;
		background: var(--color-accent);
		color: var(--color-primary);
		font-weight: 750;
	}

	.no-sensors p,
	.empty-list p {
		margin: 0;
		font-size: 0.86rem;
	}

	.saved-heading {
		margin-bottom: 17px;
	}

	.location-list {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.location-item {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border: 1px solid #edf1ef;
		border-radius: 12px;
		background: #fbfcfc;
	}

	.location-icon {
		display: grid;
		width: 36px;
		height: 36px;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 11px;
		background: #eaf5f1;
		color: var(--color-primary);
	}

	.location-icon svg {
		width: 19px;
		height: 19px;
	}

	.location-description {
		display: block;
		min-width: 0;
		flex: 1;
	}

	.location-description strong,
	.location-description small {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.location-description strong {
		font-size: 0.84rem;
		font-weight: 680;
	}

	.location-description small {
		margin-top: 3px;
		color: var(--color-muted);
		font-size: 0.72rem;
	}

	.remove-button {
		display: grid;
		width: 36px;
		height: 36px;
		flex: 0 0 auto;
		place-items: center;
		border: 0;
		border-radius: 9px;
		background: transparent;
		color: #899a97;
		cursor: pointer;
	}

	.remove-button:hover {
		background: #fff0ef;
		color: var(--color-danger);
	}

	.remove-button svg {
		width: 18px;
		height: 18px;
	}

	.page-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		margin-top: 22px;
		padding: 18px 2px;
		border-top: 1px solid var(--color-border);
	}

	.page-actions p {
		margin: 0;
		color: var(--color-muted);
		font-size: 0.82rem;
	}

	.page-actions > div {
		display: flex;
		flex-wrap: wrap;
		gap: 9px;
	}

	.save-error {
		margin-top: 18px;
	}

	@media (max-width: 850px) {
		.locations-page {
			width: min(100% - 32px, 620px);
			padding-top: 18px;
		}

		.topbar {
			margin-bottom: 32px;
		}

		.location-layout {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 520px) {
		.brand {
			gap: 9px;
		}

		.brand-mark {
			width: 40px;
			height: 40px;
		}

		.brand-name {
			font-size: 0.9rem;
		}

		.topbar > .button {
			padding: 0 10px;
			font-size: 0.8rem;
		}

		.panel {
			padding: 17px;
			border-radius: 15px;
		}

		.sensor-options {
			grid-template-columns: 1fr;
			max-height: 260px;
		}

		.page-actions {
			align-items: stretch;
			flex-direction: column;
		}

		.page-actions > div {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
