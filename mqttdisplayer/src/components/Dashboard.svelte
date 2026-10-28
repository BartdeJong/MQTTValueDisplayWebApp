<script>
	import { onMount } from "svelte";
	import { DEFAULT_LOCATIONS, parseLocationsCookie } from "../utils/locations.mjs";
	import { getLatestReadings } from "../utils/sensorApi.mjs";
	import SensorRow from "./SensorRow.svelte";

	const DAY_MS = 24 * 60 * 60 * 1000;
	function formatLocalDate(date) {
		const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
		return localDate.toISOString().slice(0, 10);
	}

	let { onManageLocations } = $props();
	let locations = $state(DEFAULT_LOCATIONS.map(location => ({ ...location })));
	let locationsError = $state("");
	let recordAmount = $state(288);
	let today = $state(formatLocalDate(new Date()));
	let customFrom = $state(formatLocalDate(new Date(Date.now() - 6 * DAY_MS)));
	let customTo = $state(today);
	let latestReadings = $state({});
	let latestError = $state("");
	let isLoadingLatest = $state(false);
	const historyRangeError = $derived.by(() => {
		if (recordAmount !== "custom") return "";
		if (!customFrom || !customTo || customFrom > customTo) {
			return "Kies een geldige start- en einddatum.";
		}
		const fromTime = Date.parse(`${customFrom}T00:00:00Z`);
		const toTime = Date.parse(`${customTo}T00:00:00Z`);
		const selectedDays = (toTime - fromTime) / DAY_MS + 1;
		if (!Number.isFinite(selectedDays) || selectedDays > 90) {
			return "Kies een periode van maximaal 90 dagen.";
		}
		if (customTo > today) return "De einddatum mag niet in de toekomst liggen.";
		return "";
	});

	onMount(() => {
		try {
			const savedLocations = parseLocationsCookie(document.cookie);
			if (savedLocations) locations = savedLocations;
		} catch (error) {
			locationsError = `${error.message} De standaardlocaties worden getoond.`;
			console.error("Saved locations could not be loaded:", error);
		}
	});

	$effect(() => {
		const sensorIds = locations.map(location => location.deviceId);
		let disposed = false;
		let requestPending = false;
		let controller;

		async function refreshReadings() {
			if (requestPending || disposed) return;
			if (sensorIds.length === 0) {
				latestReadings = {};
				latestError = "";
				isLoadingLatest = false;
				return;
			}

			requestPending = true;
			controller = new AbortController();
			isLoadingLatest = true;
			try {
				const result = await getLatestReadings(sensorIds, { signal: controller.signal });
				if (!disposed && !controller.signal.aborted) {
					latestReadings = result;
					latestError = "";
				}
			} catch (error) {
				if (!disposed && error.name !== "AbortError" && !controller.signal.aborted) {
					latestError = "Live metingen ophalen mislukt. Opnieuw proberen volgt automatisch.";
					console.error("Latest sensor readings request failed:", error);
				}
			} finally {
				requestPending = false;
				if (!disposed) isLoadingLatest = false;
			}
		}

		void refreshReadings();
		const pollTimer = setInterval(() => void refreshReadings(), 120_000);
		return () => {
			disposed = true;
			clearInterval(pollTimer);
			controller?.abort();
		};
	});
</script>

<main class="dashboard-page">
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
		<button class="button button--secondary topbar-action" type="button" onclick={onManageLocations}>
			<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
			</svg>
			Locaties beheren
		</button>
	</header>

	<section class="welcome-panel" aria-labelledby="dashboard-title">
		<div>
			<p class="eyebrow">THUISKLIMAAT</p>
			<h1 id="dashboard-title">Binnenklimaat</h1>
			<p class="welcome-copy">Temperatuur en luchtvochtigheid, helder in beeld.</p>
		</div>
		<div class="location-count" aria-label={`${locations.length} ingestelde locaties`}>
			<span class="count-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none">
					<path d="M19 10.2c0 5-7 10.3-7 10.3S5 15.2 5 10.2a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="1.7"/>
					<circle cx="12" cy="10" r="2.3" stroke="currentColor" stroke-width="1.7"/>
				</svg>
			</span>
			<span><strong>{locations.length}</strong><small>locaties</small></span>
		</div>
	</section>

	<section class="sensor-section" aria-labelledby="locations-heading">
		<div class="section-heading">
			<div>
				<h2 id="locations-heading">Jouw locaties</h2>
				<p>Kies een sensor om de meetgeschiedenis te bekijken.</p>
			</div>
			<div class="history-range-settings">
				<label class="period-control" for="date-select">
					<span>Geschiedenis</span>
					<select id="date-select" bind:value={recordAmount}>
						<option value={24}>2 uur</option>
						<option value={288}>1 dag</option>
						<option value={2016}>1 week</option>
						<option value={8640}>30 dagen</option>
						<option value={25920}>90 dagen</option>
						<option value="custom">Aangepast</option>
					</select>
				</label>
				{#if recordAmount === "custom"}
					<div class="custom-date-range">
						<label for="history-from-date">
							<span>Van</span>
							<input id="history-from-date" type="date" bind:value={customFrom} max={today} />
						</label>
						<label for="history-to-date">
							<span>Tot</span>
							<input id="history-to-date" type="date" bind:value={customTo} max={today} />
						</label>
					</div>
				{/if}
				{#if historyRangeError}
					<p class="history-range-error" role="alert">{historyRangeError}</p>
				{/if}
			</div>
		</div>

		{#if locationsError}
			<p class="message message--error" role="alert">{locationsError}</p>
		{/if}

		{#if locations.length === 0}
			<div class="empty-state">
				<span class="empty-icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
					</svg>
				</span>
				<h3>Nog geen locaties</h3>
				<p>Voeg een sensor toe om metingen te zien.</p>
				<button class="button button--primary" type="button" onclick={onManageLocations}>Locatie toevoegen</button>
			</div>
		{:else}
			<div class="sensor-grid">
				{#each locations as location (location.deviceId)}
					<SensorRow
						name={location.name}
						deviceId={location.deviceId}
						period={recordAmount}
						customFrom={customFrom}
						customTo={customTo}
						periodError={historyRangeError}
						reading={latestReadings[location.deviceId]}
						isLoading={isLoadingLatest}
						errorMessage={latestError}
					/>
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	.dashboard-page {
		width: min(100% - 48px, 1120px);
		margin: 0 auto;
		padding: 28px 0 64px;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		margin-bottom: 36px;
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
		gap: 9px;
		padding: 0 17px;
		border: 1px solid transparent;
		border-radius: 11px;
		font-size: 0.9rem;
		font-weight: 650;
		cursor: pointer;
		transition: background 150ms ease, border-color 150ms ease, transform 150ms ease;
	}

	.button:hover {
		transform: translateY(-1px);
	}

	.button svg {
		width: 18px;
		height: 18px;
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

	.button--primary:hover {
		background: var(--color-primary-dark);
	}

	.welcome-panel {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		min-height: 202px;
		margin-bottom: 38px;
		padding: 34px 40px;
		overflow: hidden;
		border: 1px solid #d8eae5;
		border-radius: 24px;
		background: linear-gradient(115deg, #e7f5f0 0%, #f0f7f2 58%, #f7f8ee 100%);
	}

	.eyebrow {
		margin: 0 0 10px;
		color: var(--color-primary);
		font-size: 0.72rem;
		font-weight: 750;
		letter-spacing: 0.12em;
	}

	.welcome-panel h1 {
		margin: 0;
		font-size: clamp(2rem, 4vw, 2.8rem);
		font-weight: 720;
		letter-spacing: -0.055em;
		line-height: 1.1;
	}

	.welcome-copy {
		margin: 12px 0 0;
		color: var(--color-muted);
		font-size: 1rem;
	}

	.location-count {
		display: flex;
		min-width: 145px;
		align-items: center;
		gap: 12px;
		padding: 15px 18px;
		border: 1px solid rgba(8, 126, 115, 0.12);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.7);
	}

	.count-icon {
		display: grid;
		width: 40px;
		height: 40px;
		place-items: center;
		border-radius: 12px;
		background: var(--color-accent);
		color: var(--color-primary);
	}

	.count-icon svg {
		width: 22px;
		height: 22px;
	}

	.location-count strong,
	.location-count small {
		display: block;
	}

	.location-count strong {
		font-size: 1.2rem;
		line-height: 1.1;
	}

	.location-count small {
		margin-top: 4px;
		color: var(--color-muted);
		font-size: 0.78rem;
	}

	.section-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 18px;
	}

	.section-heading h2 {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 720;
		letter-spacing: -0.03em;
	}

	.section-heading p {
		margin: 6px 0 0;
		color: var(--color-muted);
		font-size: 0.9rem;
	}

	.period-control {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--color-muted);
		font-size: 0.83rem;
		font-weight: 600;
	}

	.period-control select {
		min-height: 42px;
		padding: 0 34px 0 12px;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background: white;
		color: var(--color-ink);
		font-weight: 600;
	}

	.history-range-settings {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
	}

	.custom-date-range {
		display: flex;
		gap: 10px;
	}

	.custom-date-range label {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--color-muted);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.custom-date-range input {
		min-height: 38px;
		width: 148px;
		padding: 0 8px;
		border: 1px solid var(--color-border);
		border-radius: 9px;
		background: white;
		color: var(--color-ink);
		font: inherit;
	}

	.history-range-error {
		margin: 0;
		color: var(--color-danger);
		font-size: 0.78rem;
	}

	.sensor-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}

	.message {
		margin: 12px 0;
		padding: 12px 14px;
		border-radius: 10px;
	}

	.message--error {
		background: #fff0ef;
		color: var(--color-danger);
	}

	.empty-state {
		display: flex;
		min-height: 290px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 32px;
		border: 1px dashed #cbdad6;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.7);
		text-align: center;
	}

	.empty-icon {
		display: grid;
		width: 50px;
		height: 50px;
		place-items: center;
		border-radius: 16px;
		background: var(--color-accent);
		color: var(--color-primary);
	}

	.empty-icon svg {
		width: 24px;
		height: 24px;
	}

	.empty-state h3 {
		margin: 18px 0 0;
		font-size: 1.1rem;
	}

	.empty-state p {
		margin: 7px 0 18px;
		color: var(--color-muted);
	}

	@media (max-width: 720px) {
		.dashboard-page {
			width: min(100% - 32px, 560px);
			padding-top: 18px;
		}

		.topbar {
			margin-bottom: 26px;
		}

		.welcome-panel {
			min-height: 180px;
			padding: 26px;
			border-radius: 20px;
		}

		.sensor-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.dashboard-page {
			width: calc(100% - 24px);
			padding: 9px 0 16px;
		}

		.topbar {
			gap: 8px;
			margin-bottom: 7px;
		}

		.brand {
			gap: 8px;
		}

		.brand-mark {
			width: 32px;
			height: 32px;
			border-radius: 10px;
		}

		.brand-name {
			font-size: 0.8rem;
		}

		.topbar-action {
			min-height: 34px;
			gap: 4px;
			padding: 0 9px;
			border-radius: 9px;
			font-size: 0.72rem;
		}

		.topbar-action svg {
			width: 15px;
			height: 15px;
		}

		.welcome-panel {
			min-height: 0;
			margin-bottom: 8px;
			padding: 5px 0;
			border: 0;
			border-radius: 0;
			background: transparent;
		}

		.eyebrow,
		.welcome-copy,
		.location-count {
			display: none;
		}

		.welcome-panel h1 {
			font-size: 1.25rem;
			letter-spacing: -0.035em;
		}

		.section-heading {
			align-items: center;
			gap: 8px;
			margin-bottom: 7px;
		}

		.section-heading h2 {
			font-size: 0.95rem;
		}

		.section-heading p {
			display: none;
		}

		.period-control {
			gap: 5px;
			font-size: 0.68rem;
		}

		.period-control select {
			min-height: 31px;
			padding: 0 22px 0 7px;
			border-radius: 8px;
			font-size: 0.72rem;
		}

		.history-range-settings {
			align-items: flex-start;
		}

		.custom-date-range {
			flex-wrap: wrap;
			gap: 5px;
		}

		.custom-date-range label {
			gap: 4px;
			font-size: 0.68rem;
		}

		.custom-date-range input {
			min-height: 31px;
			width: 125px;
			padding: 0 5px;
			font-size: 0.72rem;
		}

		.sensor-grid {
			gap: 5px;
		}

		.empty-state {
			min-height: 180px;
			padding: 20px;
		}
	}
</style>
